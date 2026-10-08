import NetInfo from '@react-native-community/netinfo';
import { waitFor } from '@testing-library/react-native';
import { onlineManager, QueryObserver } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/api-error';
import { queryClient } from './query-client';

afterEach(() => onlineManager.setOnline(true));

test('NetInfo connectivity drives the online manager', () => {
  const listener = jest.mocked(NetInfo.addEventListener).mock.calls[0]?.[0];
  expect(listener).toBeDefined();
  listener?.({ isConnected: false } as never);
  expect(onlineManager.isOnline()).toBe(false);
  listener?.({ isConnected: true } as never);
  expect(onlineManager.isOnline()).toBe(true);
});

test('queries pause while offline and resume on reconnect', async () => {
  // QueryClientProvider mounts the client in the app; mounting wires reconnect handling.
  queryClient.mount();
  onlineManager.setOnline(false);
  const queryFn = jest.fn(async () => 'profile');
  const observer = new QueryObserver(queryClient, { queryKey: ['offline-test'], queryFn });
  const unsubscribe = observer.subscribe(() => {});
  expect(observer.getCurrentResult().fetchStatus).toBe('paused');
  expect(queryFn).not.toHaveBeenCalled();
  onlineManager.setOnline(true);
  await waitFor(() => expect(observer.getCurrentResult().data).toBe('profile'));
  unsubscribe();
  queryClient.unmount();
});

test('mutations run offline and fail fast with a network error', async () => {
  onlineManager.setOnline(false);
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => {
      throw new ApiError('network');
    },
  });
  await expect(mutation.execute(undefined)).rejects.toMatchObject({ kind: 'network' });
});
