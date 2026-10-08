import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Children, Fragment } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** A grouped list (iOS inset grouped / Material list) with an optional header and footnote. */
function ListSection({
  title,
  footer,
  className,
  children,
}: {
  title?: string;
  footer?: string;
  className?: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  return (
    <View className={cn('gap-2', className)}>
      {title ? (
        <Text role="heading" className="px-4 text-sm font-medium text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 ? <Separator className="ml-4 w-auto" /> : null}
            {item}
          </Fragment>
        ))}
      </View>
      {footer ? <Text className="px-4 text-sm text-muted-foreground">{footer}</Text> : null}
    </View>
  );
}

type ListItemProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Current value, shown on the trailing side (e.g. the selected theme). */
  value?: string;
  /** Trailing control such as a Switch; the row then does not navigate. */
  trailing?: ReactNode;
  /** Shows a chevron; defaults to true when the row is pressable and has no trailing control. */
  chevron?: boolean;
  variant?: 'default' | 'destructive';
  onPress?: () => void;
  disabled?: boolean;
  /** Overrides the role; use 'switch' with `checked` when the whole row toggles a Switch. */
  role?: 'button' | 'switch' | 'link';
  checked?: boolean;
};

/** One focusable row, at least 48pt tall. */
function ListItem({
  title,
  subtitle,
  icon,
  value,
  trailing,
  chevron,
  variant = 'default',
  onPress,
  disabled,
  role,
  checked,
}: ListItemProps) {
  const destructive = variant === 'destructive';
  const showChevron = chevron ?? (Boolean(onPress) && !trailing && !destructive);
  const content = (
    <>
      {icon ? (
        <Icon
          as={icon}
          className={cn('text-muted-foreground', destructive && 'text-destructive')}
        />
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text className={cn(destructive && 'text-destructive')}>{title}</Text>
        {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
      </View>
      {value ? (
        // Long values (emails, ids) truncate instead of squeezing the title.
        <Text className="max-w-[55%] text-right text-muted-foreground" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? <Icon as={ChevronRight} className="text-muted-foreground" /> : null}
    </>
  );
  const rowClass = cn('min-h-12 flex-row items-center gap-4 px-4 py-3', disabled && 'opacity-50');

  if (!onPress) return <View className={rowClass}>{content}</View>;
  const accessibleRole = role ?? 'button';
  return (
    <Pressable
      className={cn(rowClass, 'active:bg-accent')}
      onPress={onPress}
      disabled={disabled}
      role={accessibleRole}
      accessibilityLabel={value ? `${title}, ${value}` : title}
      accessibilityState={{
        disabled: Boolean(disabled),
        ...(accessibleRole === 'switch' ? { checked: Boolean(checked) } : {}),
      }}>
      {content}
    </Pressable>
  );
}

export { ListItem, ListSection };
export type { ListItemProps };
