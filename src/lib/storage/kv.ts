import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const kv = createMMKV({ id: 'app' });
export const zustandStorage: StateStorage = {
  getItem: (key) => kv.getString(key) ?? null,
  setItem: (key, value) => kv.set(key, value),
  removeItem: (key) => {
    kv.remove(key);
  },
};
