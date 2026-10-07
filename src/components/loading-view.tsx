import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export function LoadingView() {
  const { t } = useTranslation();
  return (
    <View className="items-center gap-4 py-8">
      <ActivityIndicator />
      <Text>{t('common.loading')}</Text>
    </View>
  );
}
