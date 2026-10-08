import { Tabs } from 'expo-router';
import { House, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TabScreenLayout } from '@/components/screen';
export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      screenLayout={({ children }) => <TabScreenLayout>{children}</TabScreenLayout>}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home'),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('common.settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
