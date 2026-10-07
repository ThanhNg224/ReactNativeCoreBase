import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { apiRequest } from './client';
import { refreshSession } from './refresh';
import { session, useSessionStore } from '@/lib/auth/session';
import { queryClient } from '@/lib/query-client';
import { secureGet, secureSet } from '@/lib/storage/secure';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { server } from '@/test/server';
import { deferred, tokens, user } from '@/test/fixtures';

const base = 'https://dummyjson.com';
const schema = z.object({ ok: z.boolean() });
const request = () => apiRequest({ path: '/protected', schema });
const readKeys = () =>
  Promise.all(['auth.accessToken', 'auth.refreshToken', 'auth.user'].map(secureGet));

beforeEach(async () => {
  await session.signOut('user');
  await session.signIn(tokens, user);
});

function expired() {
  server.use(http.get(`${base}/protected`, () => new HttpResponse(null, { status: 401 })));
}

test('three parallel 401s share one refresh and replay with the new bearer token', async () => {
  let refreshes = 0;
  let replays = 0;
  const entered = deferred();
  const release = deferred();
  server.use(
    http.get(`${base}/protected`, ({ request }) => {
      expect(request.headers.get('X-Request-Id')).toBeTruthy();
      if (request.headers.get('Authorization') === 'Bearer refreshed') {
        replays++;
        return HttpResponse.json({ ok: true });
      }
      return new HttpResponse(null, { status: 401 });
    }),
    http.post(`${base}/auth/refresh`, async ({ request }) => {
      refreshes++;
      expect(await request.json()).toEqual({ refreshToken: tokens.refreshToken, expiresInMins: 1 });
      entered.resolve();
      await release.promise;
      return HttpResponse.json({ accessToken: 'refreshed', refreshToken: 'new-refresh' });
    })
  );
  const requests = Promise.all([request(), request(), request()]);
  await entered.promise;
  release.resolve();
  await expect(requests).resolves.toEqual([{ ok: true }, { ok: true }, { ok: true }]);
  expect(refreshes).toBe(1);
  expect(replays).toBe(3);
  expect(session.getAccessToken()).toBe('refreshed');
});

test.each([403, 401, 400])(
  'refresh rejection %s clears session, secure keys and query cache',
  async (status) => {
    expired();
    queryClient.setQueryData(['private'], 'cached');
    usePreferencesStore.getState().setTheme('dark');
    server.use(http.post(`${base}/auth/refresh`, () => new HttpResponse(null, { status })));
    await expect(request()).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(useSessionStore.getState()).toMatchObject({ status: 'signedOut', user: null });
    expect(await readKeys()).toEqual([null, null, null]);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(usePreferencesStore.getState().theme).toBe('dark');
  }
);

test.each(['network', 'server'] as const)(
  'transient refresh %s keeps the current session',
  async (kind) => {
    expired();
    server.use(
      http.post(`${base}/auth/refresh`, () =>
        kind === 'network' ? HttpResponse.error() : new HttpResponse(null, { status: 500 })
      )
    );
    await expect(request()).rejects.toMatchObject({ kind });
    expect(useSessionStore.getState().status).toBe('signedIn');
    expect(session.getAccessToken()).toBe(tokens.accessToken);
    expect(await readKeys()).toEqual([
      tokens.accessToken,
      tokens.refreshToken,
      JSON.stringify(user),
    ]);
  }
);

test('refresh timeout keeps session and releases its timer', async () => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick', 'setImmediate'] });
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
  const result = refreshSession();
  await jest.advanceTimersByTimeAsync(15_000);
  await expect(result).resolves.toMatchObject({ type: 'failed', error: { kind: 'timeout' } });
  expect(useSessionStore.getState().status).toBe('signedIn');
  expect(await readKeys()).toEqual([tokens.accessToken, tokens.refreshToken, JSON.stringify(user)]);
  expect(jest.getTimerCount()).toBe(0);
  fetchMock.mockRestore();
  jest.useRealTimers();
});

test('a replayed 401 signs out without looping', async () => {
  expired();
  let count = 0;
  server.use(
    http.post(`${base}/auth/refresh`, () => {
      count++;
      return HttpResponse.json({ accessToken: 'new', refreshToken: 'new-refresh' });
    })
  );
  await expect(request()).rejects.toMatchObject({ kind: 'unauthorized' });
  expect(count).toBe(1);
  expect(useSessionStore.getState().status).toBe('signedOut');
});

test('auth false 401 does not refresh', async () => {
  expired();
  const refresh = jest.fn(() => HttpResponse.json(tokens));
  server.use(http.post(`${base}/auth/refresh`, refresh));
  await expect(apiRequest({ path: '/protected', schema, auth: false })).rejects.toMatchObject({
    kind: 'unauthorized',
  });
  expect(refresh).not.toHaveBeenCalled();
});

test('sign-out while refresh is pending fences the response and token writes', async () => {
  expired();
  const entered = deferred();
  const release = deferred();
  server.use(
    http.post(`${base}/auth/refresh`, async () => {
      entered.resolve();
      await release.promise;
      return HttpResponse.json({ accessToken: 'late', refreshToken: 'late-refresh' });
    })
  );
  const pending = request();
  const assertion = expect(pending).rejects.toMatchObject({ kind: 'cancelled' });
  await entered.promise;
  await session.signOut('user');
  release.resolve();
  await assertion;
  expect(await readKeys()).toEqual([null, null, null]);
  expect(session.getAccessToken()).toBeNull();
  expect(session.getRefreshToken()).toBeNull();
  expect(useSessionStore.getState().status).toBe('signedOut');
});

test('sign-out then immediate sign-in retains all new secure keys', async () => {
  const next = { accessToken: 'next', refreshToken: 'next-refresh' };
  const out = session.signOut('user');
  const into = session.signIn(next, user);
  await Promise.all([out, into]);
  expect(await readKeys()).toEqual([next.accessToken, next.refreshToken, JSON.stringify(user)]);
  expect(session.getAccessToken()).toBe(next.accessToken);
  expect(useSessionStore.getState().status).toBe('signedIn');
});

test.each(['valid', 'no-access', 'missing-refresh', 'corrupt-user'] as const)(
  'hydrate local state: %s',
  async (state) => {
    await session.signOut('user');
    if (state !== 'no-access') await secureSet('auth.accessToken', tokens.accessToken);
    if (state !== 'missing-refresh') await secureSet('auth.refreshToken', tokens.refreshToken);
    await secureSet('auth.user', state === 'corrupt-user' ? '{bad json' : JSON.stringify(user));
    await session.hydrate();
    const valid = state === 'valid' || state === 'no-access';
    expect(useSessionStore.getState().status).toBe(valid ? 'signedIn' : 'signedOut');
    if (!valid) expect(await readKeys()).toEqual([null, null, null]);
    if (state === 'no-access') expect(session.getAccessToken()).toBeNull();
  }
);

test('request timeout detaches caller listener and clears timer', async () => {
  jest.useFakeTimers();
  jest.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
  const caller = new AbortController();
  const remove = jest.spyOn(caller.signal, 'removeEventListener');
  const pending = apiRequest({ path: '/protected', schema, timeoutMs: 100, signal: caller.signal });
  const assertion = expect(pending).rejects.toMatchObject({ kind: 'timeout' });
  await jest.advanceTimersByTimeAsync(100);
  await assertion;
  expect(jest.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
  jest.useRealTimers();
});

test('successful HTTP response with invalid payload is invalidResponse', async () => {
  server.use(http.get(`${base}/protected`, () => HttpResponse.json({ wrong: true })));
  await expect(request()).rejects.toMatchObject({ kind: 'invalidResponse' });
});

test('authenticated requests while signed out never reach fetch', async () => {
  await session.signOut('user');
  const spy = jest.spyOn(globalThis, 'fetch');
  await expect(request()).rejects.toMatchObject({ kind: 'unauthorized' });
  expect(spy).not.toHaveBeenCalled();
});
