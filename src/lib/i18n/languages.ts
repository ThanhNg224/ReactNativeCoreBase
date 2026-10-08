import en from './locales/en.json';
import vi from './locales/vi.json';

// Single registry: add a language here and a matching locale JSON. Labels are endonyms.
export const LANGUAGES = {
  en: { label: 'English', resources: en },
  vi: { label: 'Tiếng Việt', resources: vi },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;
