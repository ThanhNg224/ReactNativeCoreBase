import { CircleAlert, Inbox, WifiOff, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { errorMessageKey, isApiError } from '@/lib/api/api-error';
import { cn } from '@/lib/utils';

/** Empty, error and offline states: icon, title, description and an optional action. */
export function StateView({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}) {
  return (
    <View
      className={cn('items-center gap-4 px-4 py-12', className)}
      accessibilityLiveRegion="polite">
      {icon ? (
        <View
          className={cn(
            'size-14 items-center justify-center rounded-full bg-muted',
            variant === 'destructive' && 'bg-destructive/10'
          )}>
          <Icon
            as={icon}
            className={cn(
              'size-7 text-muted-foreground',
              variant === 'destructive' && 'text-destructive'
            )}
          />
        </View>
      ) : null}
      <View className="items-center gap-1">
        <Text role="heading" className="text-center text-lg font-semibold">
          {title}
        </Text>
        {description ? (
          <Text className="text-center text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function EmptyState({ title, description }: { title?: string; description?: string }) {
  const { t } = useTranslation();
  return (
    <StateView
      icon={Inbox}
      title={title ?? t('common.empty')}
      {...(description ? { description } : {})}
    />
  );
}

/** Maps an ApiError to its translated message, with a retry button when given. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const offline = isApiError(error) && (error.kind === 'network' || error.kind === 'timeout');
  return (
    <StateView
      icon={offline ? WifiOff : CircleAlert}
      variant={offline ? 'default' : 'destructive'}
      title={t(offline ? 'common.offlineTitle' : 'common.errorTitle')}
      description={t(errorMessageKey(error))}
      action={
        onRetry ? (
          <Button variant="outline" onPress={onRetry}>
            <Text>{t('common.retry')}</Text>
          </Button>
        ) : null
      }
    />
  );
}

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <View className="items-center gap-4 py-12" accessibilityLiveRegion="polite">
      <ActivityIndicator colorClassName="accent-primary" />
      <Text className="text-muted-foreground">{t('common.loading')}</Text>
    </View>
  );
}
