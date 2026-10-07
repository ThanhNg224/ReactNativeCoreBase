import { queryOptions } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/client';
import { session, sessionUserSchema } from './session';

export const meResponseSchema = sessionUserSchema;
export async function fetchMe(signal: AbortSignal) {
  const epoch = session.epoch();
  const user = await apiRequest({ path: '/auth/me', schema: meResponseSchema, signal });
  session.updateUser(user, epoch);
  return user;
}
export const meQuery = () =>
  queryOptions({ queryKey: ['auth', 'me'], queryFn: ({ signal }) => fetchMe(signal) });
