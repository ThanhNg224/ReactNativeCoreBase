import type { PropsWithChildren } from 'react';
import { SafeAreaView as NativeSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

const SafeAreaView = withUniwind(NativeSafeAreaView);

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-4" edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}
