import { Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CatalogSection } from './catalog-section';

const TEXT_VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'lead',
  'large',
  'small',
  'muted',
  'code',
  'blockquote',
] as const;

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
] as const;
const BUTTON_SIZES = ['sm', 'default', 'lg'] as const;

export function TypographySection() {
  return (
    <CatalogSection title="Typography">
      {TEXT_VARIANTS.map((variant) => (
        <Text key={variant} variant={variant}>
          {variant}
        </Text>
      ))}
    </CatalogSection>
  );
}

function ButtonRow({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-2">{children}</View>;
}

export function ButtonsSection() {
  return (
    <CatalogSection title="Buttons">
      <ButtonRow>
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            <Text>{variant}</Text>
          </Button>
        ))}
      </ButtonRow>
      <ButtonRow>
        {BUTTON_SIZES.map((size) => (
          <Button key={size} size={size}>
            <Text>{size}</Text>
          </Button>
        ))}
        <Button size="icon" accessibilityLabel="Add">
          <Icon as={Plus} className="text-primary-foreground" />
        </Button>
      </ButtonRow>
      <ButtonRow>
        <Button disabled>
          <Text>disabled</Text>
        </Button>
      </ButtonRow>
    </CatalogSection>
  );
}
