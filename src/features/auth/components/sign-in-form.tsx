import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SignInInput } from '../api/auth-api';

export function useSignInForm() {
  const { t } = useTranslation();
  const schema = z.object({
    username: z.string().trim().min(1, t('auth.required')),
    password: z.string().min(1, t('auth.required')),
  });
  return useForm<SignInInput>({
    defaultValues: { username: '', password: '' },
    resolver: zodResolver(schema),
  });
}

/** The fields only; the screen owns the submit button so it can sit in the footer. */
export function SignInFields({
  control,
  pending,
  onSubmit,
}: {
  control: Control<SignInInput>;
  pending: boolean;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View className="gap-4">
      <FormField
        control={control}
        name="username"
        label={t('auth.username')}
        render={({ field, invalid, labelProps }) => (
          <Input
            {...labelProps}
            ref={field.ref}
            className={cn(invalid && 'border-destructive')}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            editable={!pending}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            placeholder={t('auth.username')}
            returnKeyType="next"
          />
        )}
      />
      <FormField
        control={control}
        name="password"
        label={t('auth.password')}
        render={({ field, invalid, labelProps }) => (
          <View className="justify-center">
            <Input
              {...labelProps}
              ref={field.ref}
              className={cn('pr-12', invalid && 'border-destructive')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              editable={!pending}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!passwordVisible}
              autoComplete="current-password"
              textContentType="password"
              placeholder={t('auth.password')}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0"
              accessibilityLabel={t(passwordVisible ? 'auth.hidePassword' : 'auth.showPassword')}
              onPress={() => setPasswordVisible((visible) => !visible)}>
              <Icon as={passwordVisible ? EyeOff : Eye} className="text-muted-foreground" />
            </Button>
          </View>
        )}
      />
    </View>
  );
}
