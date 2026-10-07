import { Pressable, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { session } from '@/lib/auth/session';

export function SettingsScreen() {
  const { t } = useTranslation();
  const preferences = usePreferencesStore();
  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerClassName="flex-grow gap-6 pb-8">
        <Text variant="h1">{t('settings.title')}</Text>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.theme')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={preferences.theme}
              onValueChange={(value) => preferences.setTheme(value as typeof preferences.theme)}>
              {(['system', 'light', 'dark'] as const).map((value) => (
                <Pressable
                  key={value}
                  className="min-h-12 flex-row items-center gap-4"
                  onPress={() => preferences.setTheme(value)}>
                  <RadioGroupItem value={value} accessibilityLabel={t(`settings.${value}`)} />
                  <Text className="flex-1">{t(`settings.${value}`)}</Text>
                </Pressable>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={preferences.language}
              onValueChange={(value) =>
                preferences.setLanguage(value as typeof preferences.language)
              }>
              {(['system', 'en', 'vi'] as const).map((value) => (
                <Pressable
                  key={value}
                  className="min-h-12 flex-row items-center gap-4"
                  onPress={() => preferences.setLanguage(value)}>
                  <RadioGroupItem value={value} accessibilityLabel={t(`settings.${value}`)} />
                  <Text className="flex-1">{t(`settings.${value}`)}</Text>
                </Pressable>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        <View className="gap-2">
          <Text className="font-semibold">{t('settings.about')}</Text>
          <Text className="text-muted-foreground">
            {t('settings.version')} {Constants.expoConfig?.version}
          </Text>
        </View>
        <View className="flex-1" />
        <Button
          className="h-12"
          variant="outline"
          onPress={() => {
            void session.signOut('user');
          }}>
          <Text>{t('settings.signOut')}</Text>
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}
