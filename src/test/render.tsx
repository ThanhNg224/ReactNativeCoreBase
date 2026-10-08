import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/providers/app-providers';

// Expo Router provides the safe area in the app; isolated screens need their own.
const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export const renderScreen = (screen: ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AppProviders>{screen}</AppProviders>
    </SafeAreaProvider>
  );
