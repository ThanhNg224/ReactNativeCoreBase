import { createRequestLifetime } from './timeout';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('timeout wins and dispose clears its timer and caller listener', async () => {
  const caller = new AbortController();
  const remove = jest.spyOn(caller.signal, 'removeEventListener');
  const lifetime = createRequestLifetime(100, caller.signal);
  const work = lifetime.race(() => new Promise(() => {}));
  const result = expect(work).rejects.toMatchObject({ kind: 'timeout' });
  jest.advanceTimersByTime(100);
  await result;
  caller.abort();
  expect(lifetime.reason).toBe('timeout');
  lifetime.dispose();
  expect(jest.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
});

test.each([false, true])('caller cancellation (already aborted: %s)', async (alreadyAborted) => {
  const caller = new AbortController();
  if (alreadyAborted) caller.abort();
  const lifetime = createRequestLifetime(100, caller.signal);
  const start = jest.fn(() => new Promise(() => {}));
  const work = lifetime.race(start);
  if (!alreadyAborted) caller.abort();
  await expect(work).rejects.toMatchObject({ kind: 'cancelled' });
  if (alreadyAborted) expect(start).not.toHaveBeenCalled();
  lifetime.dispose();
  expect(jest.getTimerCount()).toBe(0);
});

test('successful work also releases timer and listener', async () => {
  const caller = new AbortController();
  const remove = jest.spyOn(caller.signal, 'removeEventListener');
  const lifetime = createRequestLifetime(100, caller.signal);
  await expect(lifetime.race(async () => 42)).resolves.toBe(42);
  lifetime.dispose();
  expect(jest.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledTimes(1);
});
