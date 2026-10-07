import '@styles';
export { ErrorBoundary } from 'expo-router';
import { useSessionStore } from '@/lib/auth/session';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useResolveClassNames, useUniwind } from 'uniwind';
import { AppProviders } from '@/providers/app-providers';
import { useStartup } from '@/providers/use-startup';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useStartup();
  const status = useSessionStore((state) => state.status);
  const { theme } = useUniwind();
  const contentStyle = useResolveClassNames('bg-background');
  return (
    <AppProviders>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {ready ? (
        <Stack screenOptions={{ headerShown: false, contentStyle }}>
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
