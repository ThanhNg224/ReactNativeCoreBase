import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { resolveLanguage } from '@/lib/i18n';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { toast } from '@/lib/toast';
import { OptionSheet } from '@/components/option-sheet';
import { languageOptions, themeOptions } from '../preference-options';

export function AppearanceSheet() {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  return (
    <OptionSheet
      title={t('settings.theme')}
      options={themeOptions(t)}
      value={theme}
      onSelect={(next) => {
        setTheme(next);
        toast.success(t('settings.themeUpdated'));
        router.back();
      }}
    />
  );
}

export function LanguageSheet() {
  const { t } = useTranslation();
  const language = usePreferencesStore((state) => state.language);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  return (
    <OptionSheet
      title={t('settings.language')}
      options={languageOptions(t)}
      value={language}
      onSelect={(next) => {
        setLanguage(next);
        toast.success(t('settings.languageUpdated', { lng: resolveLanguage(next) }));
        router.back();
      }}
    />
  );
}
