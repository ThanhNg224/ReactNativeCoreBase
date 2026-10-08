import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPinOff } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <Screen
      scroll={false}
      footer={
        <Link href="/" asChild>
          <Button>
            <Text>{t('common.goHome')}</Text>
          </Button>
        </Link>
      }>
      <View className="flex-1 justify-center">
        <StateView icon={MapPinOff} title={t('common.notFound')} />
      </View>
    </Screen>
  );
}
