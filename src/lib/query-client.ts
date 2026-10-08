import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/api/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    // Queries pause while offline and resume on reconnect; screens show paused data as offline.
    queries: { retry: (count, error) => isApiError(error) && error.retryable && count < 2 },
    // Mutations fail fast with a network error instead of waiting for a connection.
    mutations: { retry: false, networkMode: 'always' },
  },
});

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener('change', (state) =>
    setFocused(state === 'active')
  );
  return () => subscription.remove();
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)))
);
