import { Toaster as SonnerToaster } from 'sonner-native';
import { useCSSVariable, useUniwind } from 'uniwind';

/** Mounted once by the app providers; toasts follow the card tokens of the active theme. */
export function Toaster() {
  const { theme } = useUniwind();
  const [card, border, foreground, mutedForeground] = useCSSVariable([
    '--color-card',
    '--color-border',
    '--color-card-foreground',
    '--color-muted-foreground',
  ]) as string[];
  return (
    <SonnerToaster
      theme={theme === 'dark' ? 'dark' : 'light'}
      // Top, so toasts never cover the tab bar or a screen's sticky footer actions.
      position="top-center"
      toastOptions={{
        style: { backgroundColor: card, borderColor: border, borderWidth: 1 },
        titleStyle: { color: foreground },
        descriptionStyle: { color: mutedForeground },
      }}
    />
  );
}
