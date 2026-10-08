import { apiRequest } from '@/lib/api/client';
import { authContract, type SignInInput } from '@/lib/auth/auth-contract';

export type { SignInInput };
export const signIn = (input: SignInInput) =>
  apiRequest({
    method: 'POST',
    ...authContract.login.request(input),
    auth: false,
    schema: authContract.login.response,
  });
