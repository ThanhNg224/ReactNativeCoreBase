import { queryOptions } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/client';
import { authContract } from './auth-contract';
import { session } from './session';
export async function fetchMe(signal: AbortSignal) {
  const epoch = session.epoch();
  const user = await apiRequest({
    path: authContract.me.path,
    schema: authContract.me.response,
    signal,
  });
  session.updateUser(user, epoch);
  return user;
}
export const meQuery = () =>
  queryOptions({ queryKey: ['auth', 'me'], queryFn: ({ signal }) => fetchMe(signal) });
