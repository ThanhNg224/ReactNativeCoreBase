import type { TFunction } from 'i18next';
import type { Option } from '@/components/option-sheet';
import { LANGUAGES, type LanguageCode } from '@/lib/i18n/languages';
import type { LanguagePreference, ThemePreference } from '@/lib/preferences/preferences-store';

export const themeOptions = (t: TFunction): Option<ThemePreference>[] =>
  (['system', 'light', 'dark'] as const).map((value) => ({ value, label: t(`settings.${value}`) }));

export const languageOptions = (t: TFunction): Option<LanguagePreference>[] => [
  { value: 'system', label: t('settings.system') },
  ...(Object.keys(LANGUAGES) as LanguageCode[]).map((value) => ({
    value,
    label: LANGUAGES[value].label,
  })),
];

export const labelOf = <T extends string>(options: Option<T>[], value: T) =>
  options.find((option) => option.value === value)?.label ?? value;
