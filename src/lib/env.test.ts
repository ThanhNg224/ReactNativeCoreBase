import { resolveEnv } from './env';

const config = {
  apiBaseUrl: 'https://dummyjson.com',
};

test('debug uses a short token lifetime for refresh checks', () => {
  expect(resolveEnv(config, { isDev: true }).accessTokenTtlMins).toBe(1);
});
test('release works with the same app configuration', () => {
  expect(resolveEnv(config, { isDev: false }).accessTokenTtlMins).toBe(30);
});
test('release requires HTTPS', () => {
  expect(() => resolveEnv({ apiBaseUrl: 'http://example.com' }, { isDev: false })).toThrow('HTTPS');
});
test('invalid extra fails validation', () => {
  expect(() => resolveEnv({}, { isDev: true })).toThrow();
});
