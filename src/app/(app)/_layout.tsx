import { Stack } from 'expo-router';

// Native sheets sized to their content; their screens must not use flex-1 or Screen.
const sheet = {
  presentation: 'formSheet',
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
} as const;

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="appearance" options={sheet} />
      <Stack.Screen name="language" options={sheet} />
      {/* ui-catalog:start */}
      {/* Debug-only: the guard removes the route from navigation in Release builds. */}
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="ui-catalog" />
      </Stack.Protected>
      {/* ui-catalog:end */}
    </Stack>
  );
}
