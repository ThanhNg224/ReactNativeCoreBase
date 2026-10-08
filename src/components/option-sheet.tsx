import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';

export type Option<T extends string> = { value: T; label: string };

/**
 * Content for a `formSheet` route sized to its content (`fitToContents`):
 * no flex-1 container and no scroll view, so the native sheet can measure it.
 */
export function OptionSheet<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: Option<T>[];
  value: T;
  onSelect: (value: T) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="gap-4 px-4 pt-6" style={{ paddingBottom: insets.bottom + 16 }}>
      <Text variant="h4" role="heading">
        {title}
      </Text>
      <RadioGroup value={value} onValueChange={(next) => onSelect(next as T)} className="gap-0">
        {options.map((option) => (
          <Pressable
            key={option.value}
            className="min-h-12 flex-row items-center gap-4 rounded-md active:bg-accent"
            role="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: option.value === value }}
            onPress={() => onSelect(option.value)}>
            <RadioGroupItem value={option.value} aria-hidden />
            <Text className="flex-1">{option.label}</Text>
          </Pressable>
        ))}
      </RadioGroup>
    </View>
  );
}
