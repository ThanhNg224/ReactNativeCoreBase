import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { LanguagePreference } from '@/lib/preferences/preferences-store';

import { LANGUAGES, type LanguageCode } from './languages';

export type { LanguageCode };
const codes = Object.keys(LANGUAGES) as LanguageCode[];

export function resolveLanguage(preference: LanguagePreference): LanguageCode {
  if (preference !== 'system') return preference;
  const device = getLocales()[0]?.languageCode;
  return codes.find((code) => code === device) ?? 'en';
}

void i18n.use(initReactI18next).init({
  resources: Object.fromEntries(
    codes.map((code) => [code, { translation: LANGUAGES[code].resources }])
  ),
  lng: resolveLanguage('system'),
  fallbackLng: 'en',
  supportedLngs: codes,
  interpolation: { escapeValue: false },
  initAsync: false,
});

export default i18n;
