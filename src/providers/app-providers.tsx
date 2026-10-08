import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Uniwind } from 'uniwind';

import { Toaster } from '@/components/toaster';
import i18n, { resolveLanguage } from '@/lib/i18n';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { queryClient } from '@/lib/query-client';

import { useApplyPreferences } from './use-apply-preferences';
import { useNavigationTheme } from './use-navigation-theme';

Uniwind.setTheme(usePreferencesStore.getState().theme);
// Applied synchronously (not in an effect) so UI rendered in the same update, such as a
// toast confirming the change, already uses the new theme's tokens.
usePreferencesStore.subscribe((state, previous) => {
  if (state.theme !== previous.theme) Uniwind.setTheme(state.theme);
});
void i18n.changeLanguage(resolveLanguage(usePreferencesStore.getState().language));

export function AppProviders({ children }: PropsWithChildren) {
  useApplyPreferences();
  const navigationTheme = useNavigationTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
            <PortalHost />
            <Toaster />
          </I18nextProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
