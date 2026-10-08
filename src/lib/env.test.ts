import { resolveEnv } from './env';

const config = {
  apiBaseUrl: 'https://dummyjson.com',
};

test('release works with the same app configuration', () => {
  expect(resolveEnv(config, { isDev: false }).apiBaseUrl).toBe(config.apiBaseUrl);
});
test('release requires HTTPS', () => {
  expect(() => resolveEnv({ apiBaseUrl: 'http://example.com' }, { isDev: false })).toThrow('HTTPS');
});
test('invalid extra fails validation', () => {
  expect(() => resolveEnv({}, { isDev: true })).toThrow();
});
