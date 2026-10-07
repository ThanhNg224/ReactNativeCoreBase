import Constants from 'expo-constants';
import { z } from 'zod';

const envSchema = z.object({
  apiBaseUrl: z.string().min(1),
});

export function resolveEnv(extra: unknown, { isDev }: { isDev: boolean }) {
  const result = envSchema.parse(extra);
  if (!isDev && !result.apiBaseUrl.startsWith('https://')) {
    throw new Error('Release builds require an HTTPS API base URL');
  }
  return { ...result, accessTokenTtlMins: isDev ? 1 : 30 };
}

export const env = resolveEnv(Constants.expoConfig?.extra, { isDev: __DEV__ });
