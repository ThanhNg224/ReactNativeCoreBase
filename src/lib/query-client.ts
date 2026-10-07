import { AppState } from 'react-native';
import { focusManager, QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/api/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: (count, error) => isApiError(error) && error.retryable && count < 2 },
    mutations: { retry: false },
  },
});

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener('change', (state) =>
    setFocused(state === 'active')
  );
  return () => subscription.remove();
});
