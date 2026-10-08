import { useEffect } from 'react';
import { useLocales } from 'expo-localization';

import i18n, { resolveLanguage } from '@/lib/i18n';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';

export function useApplyPreferences() {
  const language = usePreferencesStore((s) => s.language);
  const locales = useLocales();
  useEffect(() => {
    void i18n.changeLanguage(resolveLanguage(language));
  }, [language, locales]);
}
