import { server } from '@/test/server';
import { queryClient } from '@/lib/query-client';
import { cleanup } from '@testing-library/react-native';

// Query caches are cleared after each test; no five-minute GC timers should keep Jest alive.
const defaults = queryClient.getDefaultOptions();
queryClient.setDefaultOptions({
  queries: { ...defaults.queries, gcTime: Infinity },
  mutations: { ...defaults.mutations, gcTime: Infinity },
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(async () => {
  await cleanup();
  server.resetHandlers();
  queryClient.clear();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

jest.mock('react-native-mmkv', () => {
  // Use MMKV v4's own in-memory mock without importing the native Nitro factory.
  const { createMockMMKV } = jest.requireActual('react-native-mmkv/lib/createMMKV/createMockMMKV');
  return { createMMKV: createMockMMKV };
});

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      extra: { apiBaseUrl: 'https://dummyjson.com' },
    },
  },
}));

jest.mock('expo-secure-store', () => {
  const values = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 3,
    getItemAsync: jest.fn(async (key: string) => values.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      values.delete(key);
    }),
    __reset: () => values.clear(),
  };
});

jest.mock('uniwind', () => ({
  Uniwind: { setTheme: jest.fn(), currentTheme: 'light' },
  useUniwind: () => ({ theme: 'light', hasAdaptiveThemes: false }),
  withUniwind: (component: unknown) => component,
  useResolveClassNames: () => ({}),
}));

beforeEach(() => {
  // The mock is test-only; production storage stays behind lib/storage.
  const secureMock = jest.requireMock('expo-secure-store') as { __reset: () => void };
  secureMock.__reset();
});
