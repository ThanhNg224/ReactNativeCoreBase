import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { useCSSVariable, useUniwind } from 'uniwind';

const tokens = [
  '--color-primary',
  '--color-background',
  '--color-card',
  '--color-foreground',
  '--color-border',
  '--color-destructive',
] as const;

/** React Navigation colors (tab bar, headers, screen background) follow the design tokens. */
export function useNavigationTheme(): Theme {
  const { theme } = useUniwind();
  const [primary, background, card, text, border, notification] = useCSSVariable([
    ...tokens,
  ]) as string[];
  const base = theme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      primary: primary ?? base.colors.primary,
      background: background ?? base.colors.background,
      card: card ?? base.colors.card,
      text: text ?? base.colors.text,
      border: border ?? base.colors.border,
      notification: notification ?? base.colors.notification,
    },
  };
}
