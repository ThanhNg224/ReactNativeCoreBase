import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import type { SignInInput } from '../api/auth-api';

export function SignInForm({
  onSubmit,
  pending,
}: {
  onSubmit: (input: SignInInput) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const schema = z.object({
    username: z.string().trim().min(1, t('auth.required')),
    password: z.string().min(1, t('auth.required')),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    defaultValues: { username: '', password: '' },
    resolver: zodResolver(schema),
  });
  return (
    <View className="gap-6">
      {(['username', 'password'] as const).map((name) => (
        <View key={name} className="gap-2">
          <Label nativeID={`${name}-label`}>{t(`auth.${name}`)}</Label>
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                className="h-12"
                aria-labelledby={`${name}-label`}
                accessibilityLabel={t(`auth.${name}`)}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!pending}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={name === 'password'}
                autoComplete={name === 'password' ? 'current-password' : 'username'}
                placeholder={t(`auth.${name}`)}
                returnKeyType={name === 'password' ? 'done' : 'next'}
                onSubmitEditing={name === 'password' ? handleSubmit(onSubmit) : undefined}
              />
            )}
          />
          {errors[name] ? (
            <Text className="text-destructive" accessibilityLiveRegion="polite">
              {errors[name]?.message}
            </Text>
          ) : null}
        </View>
      ))}
      {__DEV__ ? <Text className="text-sm text-muted-foreground">{t('auth.demoHint')}</Text> : null}
      <Button
        className="h-12"
        disabled={pending}
        accessibilityState={{ disabled: pending, busy: pending }}
        onPress={handleSubmit(onSubmit)}>
        <Text>{t(pending ? 'auth.signingIn' : 'auth.signIn')}</Text>
      </Button>
    </View>
  );
}
