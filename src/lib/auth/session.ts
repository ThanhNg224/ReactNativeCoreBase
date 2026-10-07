import { z } from 'zod';
import { create } from 'zustand';
import { secureDelete, secureGet, secureSet } from '@/lib/storage/secure';
import { queryClient } from '@/lib/query-client';
import { logger } from '@/lib/logger';

export const sessionUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  image: z.string(),
});
export const sessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type SessionTokens = z.infer<typeof sessionTokensSchema>;
export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';
export const useSessionStore = create<{ status: SessionStatus; user: SessionUser | null }>(() => ({
  status: 'loading',
  user: null,
}));

let epoch = 0;
let accessToken: string | null = null;
let refreshToken: string | null = null;
let pending: Promise<unknown> = Promise.resolve();
const keys = ['auth.accessToken', 'auth.refreshToken', 'auth.user'] as const;
const log = logger.scope('auth');

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const result = pending.then(work);
  pending = result.catch(() => {});
  return result;
}
async function removeKeys() {
  for (const key of keys) await secureDelete(key);
}

export const session = {
  epoch: () => epoch,
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  hydrate(): Promise<void> {
    const start = epoch;
    return enqueue(async () => {
      if (start !== epoch) return;
      const [access, refresh, cached] = await Promise.all(keys.map(secureGet));
      if (start !== epoch) return;
      let user: SessionUser | undefined;
      try {
        user = sessionUserSchema.parse(JSON.parse(cached ?? 'null'));
      } catch {
        /* Invalid local cache is discarded. */
      }
      if (!refresh || !user) {
        await removeKeys();
        if (start !== epoch) return;
        accessToken = refreshToken = null;
        useSessionStore.setState({ status: 'signedOut', user: null });
        return;
      }
      accessToken = access || null;
      refreshToken = refresh;
      useSessionStore.setState({ status: 'signedIn', user });
    });
  },
  signIn(tokens: SessionTokens, user: SessionUser): Promise<void> {
    const start = ++epoch;
    return enqueue(async () => {
      if (start !== epoch) return;
      await secureSet(keys[0], tokens.accessToken);
      if (start !== epoch) return;
      await secureSet(keys[1], tokens.refreshToken);
      if (start !== epoch) return;
      await secureSet(keys[2], JSON.stringify(user));
      if (start !== epoch) return;
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      useSessionStore.setState({ status: 'signedIn', user });
    });
  },
  signOut(reason: 'user' | 'expired'): Promise<void> {
    ++epoch;
    accessToken = refreshToken = null;
    useSessionStore.setState({ status: 'signedOut', user: null });
    // Enqueue synchronously, before yielding for cancellation: new sign-ins always follow cleanup.
    return enqueue(async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await removeKeys();
      log.info('signed out', { reason });
    });
  },
  applyRefreshedTokens(tokens: SessionTokens, start: number): Promise<boolean> {
    return enqueue(async () => {
      if (start !== epoch) return false;
      await secureSet(keys[0], tokens.accessToken);
      if (start !== epoch) return false;
      await secureSet(keys[1], tokens.refreshToken);
      if (start !== epoch) return false;
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      return true;
    });
  },
  updateUser(user: SessionUser, start: number): void {
    if (start !== epoch) return;
    useSessionStore.setState({ user });
    void enqueue(async () => {
      if (start === epoch) await secureSet(keys[2], JSON.stringify(user));
    }).catch(() => log.warn('Could not persist cached user'));
  },
};
