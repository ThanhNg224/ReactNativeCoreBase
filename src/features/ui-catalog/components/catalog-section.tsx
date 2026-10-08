import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export function CatalogSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View className="gap-2">
      <Text variant="h4">{title}</Text>
      <Card className="gap-4 p-4">{children}</Card>
    </View>
  );
}
