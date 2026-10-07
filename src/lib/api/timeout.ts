import { ApiError } from './api-error';

export function createRequestLifetime(timeoutMs: number, callerSignal?: AbortSignal) {
  const controller = new AbortController();
  let reason: 'timeout' | 'cancelled' | undefined;
  let rejectAbort: (error: ApiError) => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  // A caller may dispose before starting work; the rejected abort must still be observed.
  void aborted.catch(() => {});
  const abort = (nextReason: 'timeout' | 'cancelled') => {
    if (reason) return;
    reason = nextReason;
    controller.abort();
    rejectAbort(new ApiError(nextReason));
  };
  const onCallerAbort = () => abort('cancelled');
  callerSignal?.addEventListener('abort', onCallerAbort);
  const timer = setTimeout(() => abort('timeout'), timeoutMs);
  if (callerSignal?.aborted) abort('cancelled');

  return {
    signal: controller.signal,
    get reason() {
      return reason;
    },
    async race<T>(work: () => Promise<T>): Promise<T> {
      if (reason) return aborted;
      return Promise.race([work(), aborted]);
    },
    dispose() {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', onCallerAbort);
    },
  };
}
