import '@/lib/env';
import { useEffect, useState, useSyncExternalStore } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { session, useSessionStore } from '@/lib/auth/session';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';

const persist = usePreferencesStore.persist;
const subscribeHydration = (notify: () => void) => {
  const start = persist.onHydrate(notify);
  const finish = persist.onFinishHydration(notify);
  return () => {
    start();
    finish();
  };
};

export function useStartup() {
  const hydrated = useSyncExternalStore(subscribeHydration, persist.hasHydrated);
  const status = useSessionStore((state) => state.status);
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    void session.hydrate().catch(setError);
  }, []);
  const ready = hydrated && status !== 'loading';
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);
  if (error) throw error;
  return ready;
}
