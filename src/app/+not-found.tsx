import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer>
      <Text variant="h1">{t('common.notFound')}</Text>
      <View className="flex-1 justify-end pb-8">
        <Link href="/" asChild>
          <Button className="h-12">
            <Text>{t('common.goHome')}</Text>
          </Button>
        </Link>
      </View>
    </ScreenContainer>
  );
}
