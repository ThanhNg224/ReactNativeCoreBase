import '@styles';
export { AppErrorBoundary as ErrorBoundary } from '@/components/app-error-boundary';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useUniwind } from 'uniwind';
import { useSessionStore } from '@/lib/auth/session';
import { AppProviders } from '@/providers/app-providers';
import { useStartup } from '@/providers/use-startup';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useStartup();
  const status = useSessionStore((state) => state.status);
  const { theme } = useUniwind();
  return (
    <AppProviders>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {ready ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={status === 'signedIn'}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={status === 'signedOut'}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      ) : null}
    </AppProviders>
  );
}
