import { apiRequest } from '@/lib/api/client';
import { env } from '@/lib/env';
import { sessionUserSchema, sessionTokensSchema } from '@/lib/auth/session';

export type SignInInput = { username: string; password: string };
const loginResponseSchema = sessionUserSchema
  .extend(sessionTokensSchema.shape)
  .transform((response) => ({
    tokens: sessionTokensSchema.parse(response),
    user: sessionUserSchema.parse(response),
  }));
export const signIn = (input: SignInInput) =>
  apiRequest({
    method: 'POST',
    path: '/auth/login',
    auth: false,
    body: { ...input, expiresInMins: env.accessTokenTtlMins },
    schema: loginResponseSchema,
  });
