import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage/kv';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'system' | 'en' | 'vi';
interface Preferences {
  theme: ThemePreference;
  language: LanguagePreference;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
}

export const usePreferencesStore = create<Preferences>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'system',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ theme, language }) => ({ theme, language }),
    }
  )
);
