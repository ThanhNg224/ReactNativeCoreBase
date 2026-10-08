import { useId, type ReactElement } from 'react';
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type FieldRenderArgs<T extends FieldValues, N extends FieldPath<T>> = {
  field: ControllerRenderProps<T, N>;
  invalid: boolean;
  /** Spread onto the control so screen readers announce the label. */
  labelProps: { 'aria-labelledby': string; accessibilityLabel: string };
};

/** Label, control, description and validation message for one react-hook-form field. */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  render,
}: {
  control: Control<T>;
  name: N;
  label: string;
  description?: string;
  render: (args: FieldRenderArgs<T, N>) => ReactElement;
}) {
  const labelId = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <View className="gap-2">
          <Label nativeID={labelId}>{label}</Label>
          {render({
            field,
            invalid: Boolean(error),
            labelProps: { 'aria-labelledby': labelId, accessibilityLabel: label },
          })}
          {error?.message ? (
            <Text className="text-sm text-destructive" accessibilityLiveRegion="polite">
              {error.message}
            </Text>
          ) : description ? (
            <Text className="text-sm text-muted-foreground">{description}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
