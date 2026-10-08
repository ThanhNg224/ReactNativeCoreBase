import { authContract, tokenTtlMins } from './auth-contract';

const user = {
  id: 1,
  username: 'emilys',
  firstName: 'Emily',
  lastName: 'Johnson',
  email: 'emily@example.com',
  image: 'https://example.com/e.png',
};

test('debug uses a short token lifetime for refresh checks', () => {
  expect(tokenTtlMins(true)).toBe(1);
});
test('release uses the long token lifetime', () => {
  expect(tokenTtlMins(false)).toBe(30);
});
test('flat login response parses into tokens and user', () => {
  const parsed = authContract.login.response.safeParse({
    ...user,
    accessToken: 'a',
    refreshToken: 'r',
    gender: 'female',
  });
  expect(parsed.success && parsed.data).toEqual({
    tokens: { accessToken: 'a', refreshToken: 'r' },
    user,
  });
});
test('malformed login response fails', () => {
  expect(authContract.login.response.safeParse({ ...user }).success).toBe(false);
});
