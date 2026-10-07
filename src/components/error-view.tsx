import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { errorMessageKey } from '@/lib/api/api-error';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function ErrorView({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  // P2 maps the typed API error to its translated message key.
  return (
    <View className="gap-4 py-4" accessibilityLiveRegion="polite">
      <Text className="text-destructive">{t(errorMessageKey(error))}</Text>
      {onRetry ? (
        <Button variant="outline" onPress={onRetry}>
          <Text>{t('common.retry')}</Text>
        </Button>
      ) : null}
    </View>
  );
}
