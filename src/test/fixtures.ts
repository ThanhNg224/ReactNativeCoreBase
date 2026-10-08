import type { SessionUser } from '@/lib/auth/auth-contract';

export const user: SessionUser = {
  id: 1,
  username: 'emilys',
  firstName: 'Emily',
  lastName: 'Johnson',
  email: 'emily@example.com',
  image: 'https://dummyjson.com/icon/emilys/128',
};
export const tokens = { accessToken: 'test-access', refreshToken: 'test-refresh' };

export function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
