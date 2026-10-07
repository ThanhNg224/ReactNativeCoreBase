import { Image, RefreshControl, ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/screen-container';
import { ErrorView } from '@/components/error-view';
import { LoadingView } from '@/components/loading-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { meQuery } from '@/lib/auth/me-query';
import { useSessionStore } from '@/lib/auth/session';

export function HomeScreen() {
  const { t } = useTranslation();
  const cached = useSessionStore((state) => state.user);
  const query = useQuery({ ...meQuery(), ...(cached ? { placeholderData: cached } : {}) });
  const user = query.data ?? cached;
  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-8 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              void query.refetch();
            }}
          />
        }>
        <Text variant="h1">{t('home.title')}</Text>
        {query.isPending ? <LoadingView /> : null}
        {query.error ? (
          <ErrorView
            error={query.error}
            onRetry={() => {
              void query.refetch();
            }}
          />
        ) : null}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('home.profile')}</CardTitle>
            </CardHeader>
            <CardContent className="gap-6">
              <Image
                className="size-24 rounded-full bg-muted"
                source={{ uri: user.image }}
                accessibilityLabel={t('home.profile')}
              />
              <View className="gap-2">
                <Text variant="h2">{t('home.welcome', { name: user.firstName })}</Text>
                <Text>
                  {user.firstName} {user.lastName}
                </Text>
                <Text className="text-muted-foreground">{user.email}</Text>
              </View>
            </CardContent>
          </Card>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
