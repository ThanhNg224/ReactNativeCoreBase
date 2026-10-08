import { RefreshControl, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AtSign, Mail, WifiOff } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import { ErrorState, StateView } from '@/components/state-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListItem, ListSection } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { meQuery } from '@/lib/auth/me-query';
import type { SessionUser } from '@/lib/auth/auth-contract';
import { useSessionStore } from '@/lib/auth/session';
import { useIsOnline } from '@/lib/use-is-online';

export function HomeScreen() {
  const { t } = useTranslation();
  const online = useIsOnline();
  const cached = useSessionStore((state) => state.user);
  const query = useQuery({ ...meQuery(), ...(cached ? { placeholderData: cached } : {}) });
  const user = query.data ?? cached;
  // A paused query is waiting for a connection; it is not loading.
  const paused = query.fetchStatus === 'paused';
  const refetch = () => {
    void query.refetch();
  };

  return (
    <Screen
      title={t('home.title')}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={refetch} />}>
      {user && (paused || !online) ? (
        <Alert icon={WifiOff}>
          <AlertTitle>{t('common.offlineTitle')}</AlertTitle>
          <AlertDescription>{t('common.offlineMessage')}</AlertDescription>
        </Alert>
      ) : null}
      {user ? (
        <Profile user={user} />
      ) : paused ? (
        <StateView
          icon={WifiOff}
          title={t('common.offlineTitle')}
          description={t('errors.network')}
        />
      ) : query.isPending ? (
        <ProfileSkeleton />
      ) : null}
      {query.error && !paused ? <ErrorState error={query.error} onRetry={refetch} /> : null}
    </Screen>
  );
}

function Profile({ user }: { user: SessionUser }) {
  const { t } = useTranslation();
  return (
    <View className="gap-6">
      <View className="flex-row items-center gap-4">
        <Avatar alt={`${user.firstName} ${user.lastName}`} className="size-16">
          <AvatarImage source={{ uri: user.image }} />
          <AvatarFallback>
            <Text>{`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1 gap-1">
          <Text variant="h3">{t('home.welcome', { name: user.firstName })}</Text>
          <Text className="text-muted-foreground">
            {user.firstName} {user.lastName}
          </Text>
        </View>
      </View>
      <ListSection title={t('home.profile')}>
        <ListItem icon={AtSign} title={t('home.username')} value={user.username} />
        <ListItem icon={Mail} title={t('home.email')} value={user.email} />
      </ListSection>
    </View>
  );
}

function ProfileSkeleton() {
  const { t } = useTranslation();
  return (
    <View className="gap-6" accessibilityLabel={t('common.loading')} role="progressbar">
      <View className="flex-row items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      </View>
      <Skeleton className="h-28 w-full rounded-xl" />
    </View>
  );
}
