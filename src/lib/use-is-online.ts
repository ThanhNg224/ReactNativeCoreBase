import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => onlineManager.subscribe(notify);
const isOnline = () => onlineManager.isOnline();

/** Connectivity as seen by TanStack Query (driven by NetInfo). */
export function useIsOnline() {
  return useSyncExternalStore(subscribe, isOnline);
}
