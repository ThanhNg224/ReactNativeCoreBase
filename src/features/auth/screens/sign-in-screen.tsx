import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Info, WifiOff } from 'lucide-react-native';
import { Screen } from '@/components/screen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { errorMessageKey, isApiError } from '@/lib/api/api-error';
import { useIsOnline } from '@/lib/use-is-online';
import { SignInFields, useSignInForm } from '../components/sign-in-form';
import { useSignInMutation } from '../api/auth-mutations';

export function SignInScreen() {
  const { t } = useTranslation();
  const online = useIsOnline();
  const mutation = useSignInMutation();
  const form = useSignInForm();
  const submit = form.handleSubmit((input) => mutation.mutate(input));
  const pending = mutation.isPending;
  return (
    <Screen
      contentClassName="justify-end"
      footer={
        <Button
          disabled={pending}
          accessibilityState={{ disabled: pending, busy: pending }}
          onPress={submit}>
          <Text>{t(pending ? 'auth.signingIn' : 'auth.signIn')}</Text>
        </Button>
      }>
      <View className="gap-2">
        <Text variant="h1">{t('auth.welcome')}</Text>
        <Text className="text-muted-foreground">{t('auth.subtitle')}</Text>
      </View>
      {!online ? (
        <Alert icon={WifiOff}>
          <AlertTitle>{t('common.offlineTitle')}</AlertTitle>
          <AlertDescription>{t('auth.offline')}</AlertDescription>
        </Alert>
      ) : null}
      {mutation.error ? (
        <Alert icon={CircleAlert} variant="destructive">
          <AlertTitle>
            {t(
              isApiError(mutation.error) && mutation.error.kind === 'validation'
                ? 'auth.invalidCredentials'
                : errorMessageKey(mutation.error)
            )}
          </AlertTitle>
        </Alert>
      ) : null}
      <SignInFields control={form.control} pending={pending} onSubmit={submit} />
      {__DEV__ ? (
        <Alert icon={Info}>
          <AlertDescription>{t('auth.demoHint')}</AlertDescription>
        </Alert>
      ) : null}
    </Screen>
  );
}
