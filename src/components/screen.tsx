import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react';
import { View, type RefreshControlProps } from 'react-native';
import {
  KeyboardAwareScrollView as NativeKeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const KeyboardAwareScrollView = withUniwind(NativeKeyboardAwareScrollView);

// Tab screens sit above the tab bar, which already reserves the bottom safe area.
const InsideTabsContext = createContext(false);

/** Pass to `<Tabs screenLayout>` so screens inside tabs skip the bottom inset. */
export function TabScreenLayout({ children }: PropsWithChildren) {
  return <InsideTabsContext.Provider value>{children}</InsideTabsContext.Provider>;
}

const KEYBOARD_GAP = 16;

type ScreenProps = PropsWithChildren<{
  title?: string;
  /** Scrolls and keeps the focused input above the keyboard (default). */
  scroll?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  /** Primary actions, pinned to the bottom and lifted with the keyboard. */
  footer?: ReactNode;
  contentClassName?: string;
}>;

/**
 * Screen frame: safe areas, large title, keyboard handling and a sticky footer.
 * The screen owns the bottom inset unless it is rendered inside tabs.
 */
export function Screen({
  title,
  scroll = true,
  refreshControl,
  footer,
  contentClassName,
  children,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const insideTabs = useContext(InsideTabsContext);
  const bottomInset = insideTabs ? 0 : insets.bottom;
  const [footerHeight, setFooterHeight] = useState(0);
  const contentClass = cn('gap-6 px-4 pt-4', contentClassName);
  // The footer sits below the scroll view and clears the bottom inset itself.
  const contentBottom = footer ? KEYBOARD_GAP : bottomInset + 32;
  const content = (
    <>
      {title ? <Text variant="h1">{title}</Text> : null}
      {children}
    </>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
      {scroll ? (
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName={contentClass}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: contentBottom }}
          // While the keyboard is open the footer floats above it, so inputs must clear both.
          bottomOffset={(footer ? footerHeight : 0) + KEYBOARD_GAP}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {content}
        </KeyboardAwareScrollView>
      ) : (
        <View className={cn('flex-1', contentClass)} style={{ paddingBottom: contentBottom }}>
          {content}
        </View>
      )}
      {footer ? (
        <KeyboardStickyView
          // The footer already clears the bottom inset; drop it while the keyboard is open.
          offset={{ closed: 0, opened: bottomInset }}
          onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}>
          <View
            className="gap-3 bg-background px-4 pt-4"
            style={{ paddingBottom: bottomInset + 16 }}>
            {footer}
          </View>
        </KeyboardStickyView>
      ) : null}
    </View>
  );
}
