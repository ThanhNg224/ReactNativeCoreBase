import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { errorMessageKey, isApiError } from '@/lib/api/api-error';
import { SignInForm } from '../components/sign-in-form';
import { useSignInMutation } from '../api/auth-mutations';

export function SignInScreen() {
  const { t } = useTranslation();
  const mutation = useSignInMutation();
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-end gap-8 pb-8"
          keyboardShouldPersistTaps="handled">
          <View className="gap-2">
            <Text variant="h1">{t('auth.welcome')}</Text>
            <Text className="text-muted-foreground">{t('auth.subtitle')}</Text>
          </View>
          {mutation.error ? (
            <Text className="text-destructive" accessibilityLiveRegion="polite">
              {t(
                isApiError(mutation.error) && mutation.error.kind === 'validation'
                  ? 'auth.invalidCredentials'
                  : errorMessageKey(mutation.error)
              )}
            </Text>
          ) : null}
          <SignInForm pending={mutation.isPending} onSubmit={(input) => mutation.mutate(input)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
