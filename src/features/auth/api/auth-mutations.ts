import { useMutation } from '@tanstack/react-query';
import { session } from '@/lib/auth/session';
import { signIn } from './auth-api';

export function useSignInMutation() {
  return useMutation({
    mutationFn: signIn,
    onSuccess: ({ tokens, user }) => session.signIn(tokens, user),
  });
}
