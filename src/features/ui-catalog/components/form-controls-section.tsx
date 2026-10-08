import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { CatalogSection } from './catalog-section';

const FRUITS = ['Apple', 'Banana', 'Cherry'] as const;
const RADIO_OPTIONS = ['one', 'two'] as const;

export function FormControlsSection() {
  const insets = useSafeAreaInsets();
  const [fruit, setFruit] = useState<{ value: string; label: string }>();
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [radio, setRadio] = useState('one');
  const contentInsets = { top: insets.top, bottom: insets.bottom, left: 12, right: 12 };

  return (
    <CatalogSection title="Form controls">
      <Input accessibilityLabel="Normal input" defaultValue="Normal input" />
      <Input accessibilityLabel="Placeholder input" placeholder="Placeholder" />
      <Input accessibilityLabel="Disabled input" defaultValue="Not editable" editable={false} />
      <Textarea accessibilityLabel="Textarea" placeholder="Textarea" />
      <Select value={fruit} onValueChange={setFruit}>
        <SelectTrigger className="w-full" accessibilityLabel="Fruit">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent insets={contentInsets}>
          {FRUITS.map((name) => (
            <SelectItem key={name} value={name} label={name} />
          ))}
        </SelectContent>
      </Select>
      <Pressable
        className="min-h-12 flex-row items-center gap-3"
        role="checkbox"
        accessibilityLabel="Checkbox"
        accessibilityState={{ checked }}
        onPress={() => setChecked(!checked)}>
        <View pointerEvents="none">
          <Checkbox checked={checked} onCheckedChange={setChecked} aria-hidden />
        </View>
        <Text>Checkbox</Text>
      </Pressable>
      <Pressable
        className="min-h-12 flex-row items-center gap-3"
        role="switch"
        accessibilityLabel="Switch"
        accessibilityState={{ checked: enabled }}
        onPress={() => setEnabled(!enabled)}>
        <View pointerEvents="none">
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-hidden />
        </View>
        <Text>Switch</Text>
      </Pressable>
      <RadioGroup value={radio} onValueChange={setRadio}>
        {RADIO_OPTIONS.map((value) => (
          <Pressable
            key={value}
            className="min-h-12 flex-row items-center gap-3"
            role="radio"
            accessibilityLabel={`Option ${value}`}
            accessibilityState={{ checked: radio === value }}
            onPress={() => setRadio(value)}>
            <View pointerEvents="none">
              <RadioGroupItem value={value} aria-hidden />
            </View>
            <Text>Option {value}</Text>
          </Pressable>
        ))}
      </RadioGroup>
    </CatalogSection>
  );
}
