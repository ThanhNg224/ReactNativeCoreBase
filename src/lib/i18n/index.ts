import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { LanguagePreference } from '@/lib/preferences/preferences-store';

import en from './locales/en.json';
import vi from './locales/vi.json';

export function resolveLanguage(preference: LanguagePreference) {
  if (preference !== 'system') return preference;
  return getLocales()[0]?.languageCode === 'vi' ? 'vi' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: resolveLanguage('system'),
  fallbackLng: 'en',
  supportedLngs: ['en', 'vi'],
  interpolation: { escapeValue: false },
  initAsync: false,
});

export default i18n;
