export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'server'
  | 'invalidResponse';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    readonly status?: number,
    readonly requestId?: string
  ) {
    super(kind);
    this.name = 'ApiError';
  }

  get retryable() {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export function apiErrorFromStatus(status: number, requestId?: string) {
  const kind: ApiErrorKind =
    status === 401
      ? 'unauthorized'
      : status === 403
        ? 'forbidden'
        : status === 404
          ? 'notFound'
          : status === 408
            ? 'timeout'
            : status === 429 || status >= 500
              ? 'server'
              : 'validation';
  return new ApiError(kind, status, requestId);
}

export function errorMessageKey(error: unknown): `errors.${ApiErrorKind | 'unknown'}` {
  return isApiError(error) ? `errors.${error.kind}` : 'errors.unknown';
}
