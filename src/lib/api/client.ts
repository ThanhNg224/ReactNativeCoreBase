import type { z } from 'zod';
import { session, useSessionStore } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { ApiError, apiErrorFromStatus, isApiError } from './api-error';
import { buildQuery, joinUrl } from './join-url';
import { refreshSession } from './refresh';
import { createRequestLifetime } from './timeout';

export interface ApiRequest<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  schema: z.ZodType<T>;
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}
let nextRequestId = 0;

export async function apiRequest<T>(req: ApiRequest<T>): Promise<T> {
  const auth = req.auth ?? true;
  const start = session.epoch();
  if (auth && useSessionStore.getState().status !== 'signedIn') throw new ApiError('unauthorized');
  const requestId = `${Date.now()}-${++nextRequestId}`;
  const lifetime = createRequestLifetime(req.timeoutMs ?? 15_000, req.signal);
  const query = req.query ? buildQuery(req.query) : '';
  const url = `${joinUrl(env.apiBaseUrl, req.path)}${query ? `?${query}` : ''}`;
  const checkCurrent = () => {
    if (auth && start !== session.epoch()) throw new ApiError('cancelled', undefined, requestId);
    if (lifetime.reason) throw new ApiError(lifetime.reason, undefined, requestId);
  };
  const send = async (replayed: boolean): Promise<T> => {
    checkCurrent();
    const token = auth ? session.getAccessToken() : null;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Request-Id': requestId,
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (req.body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(url, {
      method: req.method ?? 'GET',
      credentials: 'omit',
      signal: lifetime.signal,
      headers,
      ...(req.body === undefined ? {} : { body: JSON.stringify(req.body) }),
    });
    checkCurrent();
    if (response.status === 401 && auth) {
      if (replayed) {
        const cleanup = session.signOut('expired');
        const signedOutEpoch = session.epoch();
        await cleanup;
        if (session.epoch() !== signedOutEpoch)
          throw new ApiError('cancelled', undefined, requestId);
        throw new ApiError('unauthorized', 401, requestId);
      }
      // A late 401 may arrive after another request already completed refresh.
      if (token === session.getAccessToken()) {
        const outcome = await refreshSession();
        if (outcome.type === 'rejected') throw new ApiError('unauthorized', 401, requestId);
        checkCurrent();
        if (outcome.type === 'failed') throw outcome.error;
        if (outcome.type === 'stale') throw new ApiError('cancelled', undefined, requestId);
      }
      return send(true);
    }
    if (!response.ok) throw apiErrorFromStatus(response.status, requestId);
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new ApiError('invalidResponse', response.status, requestId);
    }
    checkCurrent();
    const parsed = req.schema.safeParse(json);
    if (!parsed.success) throw new ApiError('invalidResponse', response.status, requestId);
    return parsed.data;
  };
  try {
    return await lifetime.race(() => send(false));
  } catch (error) {
    // Deliberate expiry belongs to this request and reports unauthorized, despite sign-out's epoch bump.
    if (isApiError(error) && error.kind === 'unauthorized') throw error;
    checkCurrent();
    throw isApiError(error) ? error : new ApiError('network', undefined, requestId);
  } finally {
    lifetime.dispose();
  }
}
