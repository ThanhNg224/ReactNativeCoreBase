import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useUniwind } from 'uniwind';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { usePreferencesStore } from '@/lib/preferences/preferences-store';
import { DataDisplaySection, StatesSection } from '../components/data-states-section';
import { FeedbackSection, OverlaysSection } from '../components/feedback-overlays-section';
import { FormControlsSection } from '../components/form-controls-section';
import { ButtonsSection, TypographySection } from '../components/typography-buttons-section';

export function UiCatalogScreen() {
  const { theme } = useUniwind();
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const dark = theme === 'dark';
  return (
    <Screen title="UI catalog">
      <View className="flex-row items-center justify-between">
        <Button variant="ghost" onPress={() => router.back()}>
          <Text>Back</Text>
        </Button>
        <Pressable
          className="min-h-12 flex-row items-center gap-3"
          role="switch"
          accessibilityLabel="Dark mode"
          accessibilityState={{ checked: dark }}
          onPress={() => setTheme(dark ? 'light' : 'dark')}>
          <Text>Dark mode</Text>
          <View pointerEvents="none">
            <Switch
              checked={dark}
              onCheckedChange={(value) => setTheme(value ? 'dark' : 'light')}
              aria-hidden
            />
          </View>
        </Pressable>
      </View>
      <TypographySection />
      <ButtonsSection />
      <FormControlsSection />
      <FeedbackSection />
      <OverlaysSection />
      <DataDisplaySection />
      <StatesSection />
    </Screen>
  );
}
