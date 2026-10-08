import { useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CircleAlert } from 'lucide-react-native';
import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { logger } from '@/lib/logger';

const log = logger.scope('app');

// Rendered without the app providers, so it relies only on module singletons (i18n, Uniwind).
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  useEffect(() => {
    // Only the error name: messages may contain personal data.
    log.error('render error', { name: error.name });
    void SplashScreen.hideAsync();
  }, [error]);
  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-center">
        <StateView
          icon={CircleAlert}
          variant="destructive"
          title={t('common.errorTitle')}
          description={t('errors.unknown')}
          action={
            <Button onPress={() => void retry()}>
              <Text>{t('common.retry')}</Text>
            </Button>
          }
        />
      </View>
    </Screen>
  );
}
