import { ApiError, apiErrorFromStatus, errorMessageKey } from './api-error';
import { buildQuery, joinUrl } from './join-url';

test.each([
  [400, 'validation'],
  [422, 'validation'],
  [401, 'unauthorized'],
  [403, 'forbidden'],
  [404, 'notFound'],
  [408, 'timeout'],
  [429, 'server'],
  [500, 'server'],
  [409, 'validation'],
])('maps HTTP %s', (status, kind) => {
  const error = apiErrorFromStatus(status as number, 'id');
  expect(error).toMatchObject({ kind, status, requestId: 'id' });
  expect(errorMessageKey(error)).toBe(`errors.${kind}`);
});
test('retry policy is restricted to transient failures', () => {
  expect(new ApiError('network').retryable).toBe(true);
  expect(new ApiError('timeout').retryable).toBe(true);
  expect(new ApiError('server').retryable).toBe(true);
  expect(new ApiError('unauthorized').retryable).toBe(false);
  expect(new ApiError('invalidResponse').retryable).toBe(false);
  expect(errorMessageKey(new Error())).toBe('errors.unknown');
});
test('joins and encodes query values without runtime URL APIs', () => {
  expect(joinUrl('https://example.com///', '//auth/me')).toBe('https://example.com/auth/me');
  expect(buildQuery({ q: 'a & b', page: 2, flag: false, empty: undefined })).toBe(
    'q=a%20%26%20b&page=2&flag=false'
  );
});
