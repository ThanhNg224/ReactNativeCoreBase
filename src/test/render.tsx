import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/app-providers';

export const renderScreen = (screen: ReactElement) => render(<AppProviders>{screen}</AppProviders>);
