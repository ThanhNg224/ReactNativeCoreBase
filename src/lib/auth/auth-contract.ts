// Backend auth contract. Pointing the app at another backend with the same model
// (access + refresh tokens, `Authorization: Bearer`) means editing only this file and `apiBaseUrl`.
// The Bearer header, POST refresh and single-flight stay in lib/api; a different sign-in UI
// still needs features/auth changes.
import { z } from 'zod';

export const sessionUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  image: z.string(),
});
export const sessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type SessionTokens = z.infer<typeof sessionTokensSchema>;
export type SignInInput = { username: string; password: string };

export const tokenTtlMins = (isDev: boolean) => (isDev ? 1 : 30);
export const accessTokenTtlMins = tokenTtlMins(__DEV__);

export const authContract = {
  login: {
    request: (input: SignInInput) => ({
      path: '/auth/login',
      body: { ...input, expiresInMins: accessTokenTtlMins },
    }),
    // DummyJSON returns the user fields and both tokens in one flat object.
    response: sessionUserSchema.extend(sessionTokensSchema.shape).transform((response) => ({
      tokens: sessionTokensSchema.parse(response),
      user: sessionUserSchema.parse(response),
    })),
  },
  refresh: {
    request: (refreshToken: string) => ({
      path: '/auth/refresh',
      body: { refreshToken, expiresInMins: accessTokenTtlMins },
    }),
    response: sessionTokensSchema,
    rejectStatuses: [400, 401, 403],
  },
  me: {
    path: '/auth/me',
    response: sessionUserSchema,
  },
};
