import { useEffect } from 'react';
import { useLocales } from 'expo-localization';
import { Uniwind } from 'uniwind';

import i18n, { resolveLanguage } from '@/lib/i18n';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';

export function useApplyPreferences() {
  const theme = usePreferencesStore((s) => s.theme);
  const language = usePreferencesStore((s) => s.language);
  const locales = useLocales();
  useEffect(() => {
    Uniwind.setTheme(theme);
  }, [theme]);
  useEffect(() => {
    void i18n.changeLanguage(resolveLanguage(language));
  }, [language, locales]);
}
