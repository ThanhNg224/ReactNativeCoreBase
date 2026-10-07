import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export function EmptyView() {
  const { t } = useTranslation();
  return <Text className="text-muted-foreground">{t('common.empty')}</Text>;
}
