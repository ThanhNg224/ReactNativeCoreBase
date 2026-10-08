import { authContract } from '@/lib/auth/auth-contract';
import { session } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { ApiError, apiErrorFromStatus, isApiError } from './api-error';
import { joinUrl } from './join-url';
import { createRequestLifetime } from './timeout';

export type RefreshOutcome =
  | { type: 'refreshed' }
  | { type: 'rejected' }
  | { type: 'failed'; error: ApiError }
  | { type: 'stale' };

let inFlight: { epoch: number; promise: Promise<RefreshOutcome> } | null = null;

async function runRefresh(start: number): Promise<RefreshOutcome> {
  const token = session.getRefreshToken();
  if (!token) {
    const cleanup = session.signOut('expired');
    const signedOutEpoch = session.epoch();
    await cleanup;
    return { type: session.epoch() === signedOutEpoch ? 'rejected' : 'stale' };
  }
  const lifetime = createRequestLifetime(15_000);
  try {
    return await lifetime.race(async () => {
      const request = authContract.refresh.request(token);
      const response = await fetch(joinUrl(env.apiBaseUrl, request.path), {
        method: 'POST',
        credentials: 'omit',
        signal: lifetime.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      if (start !== session.epoch()) return { type: 'stale' };
      if (lifetime.reason) throw new ApiError(lifetime.reason);
      if (authContract.refresh.rejectStatuses.includes(response.status)) {
        const cleanup = session.signOut('expired');
        const signedOutEpoch = session.epoch();
        await cleanup;
        if (session.epoch() !== signedOutEpoch) return { type: 'stale' };
        return { type: 'rejected' };
      }
      if (!response.ok) throw apiErrorFromStatus(response.status);
      let json: unknown;
      try {
        json = await response.json();
      } catch {
        throw new ApiError('invalidResponse');
      }
      const parsed = authContract.refresh.response.safeParse(json);
      if (!parsed.success) throw new ApiError('invalidResponse');
      if (lifetime.reason) throw new ApiError(lifetime.reason);
      const applied = await session.applyRefreshedTokens(parsed.data, start);
      return { type: applied ? 'refreshed' : 'stale' };
    });
  } catch (error) {
    if (start !== session.epoch()) return { type: 'stale' };
    return {
      type: 'failed',
      error: lifetime.reason
        ? new ApiError(lifetime.reason)
        : isApiError(error)
          ? error
          : new ApiError('network'),
    };
  } finally {
    lifetime.dispose();
  }
}

export function refreshSession(): Promise<RefreshOutcome> {
  const start = session.epoch();
  if (inFlight?.epoch === start) return inFlight.promise;
  const promise = runRefresh(start).finally(() => {
    if (inFlight?.promise === promise) inFlight = null;
  });
  inFlight = { epoch: start, promise };
  return promise;
}
