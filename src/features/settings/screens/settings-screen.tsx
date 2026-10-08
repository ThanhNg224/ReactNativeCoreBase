import { useState } from 'react';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Info, Languages, LogOut, SunMoon } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ListItem, ListSection } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { session } from '@/lib/auth/session';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { labelOf, languageOptions, themeOptions } from '../preference-options';

export function SettingsScreen() {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const language = usePreferencesStore((state) => state.language);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  return (
    <Screen title={t('settings.title')}>
      <ListSection title={t('settings.preferences')}>
        <ListItem
          icon={SunMoon}
          title={t('settings.theme')}
          value={labelOf(themeOptions(t), theme)}
          onPress={() => router.push('/appearance')}
        />
        <ListItem
          icon={Languages}
          title={t('settings.language')}
          value={labelOf(languageOptions(t), language)}
          onPress={() => router.push('/language')}
        />
      </ListSection>
      <ListSection title={t('settings.about')}>
        <ListItem
          icon={Info}
          title={t('settings.version')}
          value={Constants.expoConfig?.version ?? ''}
        />
      </ListSection>
      {/* ui-catalog:start */}
      {__DEV__ ? (
        <ListSection title="Developer">
          <ListItem title="UI catalog" onPress={() => router.push('/ui-catalog')} />
        </ListSection>
      ) : null}
      {/* ui-catalog:end */}
      <ListSection title={t('settings.account')}>
        <ListItem
          icon={LogOut}
          title={t('settings.signOut')}
          variant="destructive"
          onPress={() => setConfirmSignOut(true)}
        />
      </ListSection>
      <AlertDialog open={confirmSignOut} onOpenChange={setConfirmSignOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.signOutConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.signOutConfirmMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>{t('common.cancel')}</Text>
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onPress={() => void session.signOut('user')}>
              <Text>{t('settings.signOut')}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
