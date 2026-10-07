import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Uniwind, useUniwind } from 'uniwind';

import i18n, { resolveLanguage } from '@/lib/i18n';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { queryClient } from '@/lib/query-client';

import { useApplyPreferences } from './use-apply-preferences';

Uniwind.setTheme(usePreferencesStore.getState().theme);
void i18n.changeLanguage(resolveLanguage(usePreferencesStore.getState().language));

export function AppProviders({ children }: PropsWithChildren) {
  useApplyPreferences();
  const { theme } = useUniwind();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
          {children}
        </ThemeProvider>
        <PortalHost />
      </I18nextProvider>
    </QueryClientProvider>
  );
}
