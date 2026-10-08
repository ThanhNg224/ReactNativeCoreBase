import { Bell, Inbox, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { EmptyState, ErrorState, LoadingState, StateView } from '@/components/state-view';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ListItem, ListSection } from '@/components/ui/list';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { ApiError } from '@/lib/api/api-error';
import { CatalogSection } from './catalog-section';

export function DataDisplaySection() {
  const [notifications, setNotifications] = useState(true);
  return (
    <CatalogSection title="Data display">
      <View className="flex-row gap-3">
        <Avatar alt="Avatar with image">
          <AvatarImage source={{ uri: 'https://i.pravatar.cc/150?img=5' }} />
          <AvatarFallback>
            <Text>AB</Text>
          </AvatarFallback>
        </Avatar>
        <Avatar alt="Fallback avatar">
          <AvatarFallback>
            <Text>CD</Text>
          </AvatarFallback>
        </Avatar>
      </View>
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Card content</Text>
        </CardContent>
        <CardFooter>
          <Button size="sm">
            <Text>Action</Text>
          </Button>
        </CardFooter>
      </Card>
      <ListSection title="List section" footer="List section footer">
        <ListItem icon={Settings} title="With icon" value="Value" onPress={() => undefined} />
        <ListItem title="With subtitle" subtitle="Supporting text" />
        <ListItem
          icon={Bell}
          title="With switch"
          role="switch"
          checked={notifications}
          onPress={() => setNotifications(!notifications)}
          trailing={
            <View pointerEvents="none">
              <Switch checked={notifications} onCheckedChange={setNotifications} aria-hidden />
            </View>
          }
        />
        <ListItem title="Destructive" variant="destructive" onPress={() => undefined} />
      </ListSection>
      <Separator />
    </CatalogSection>
  );
}

export function StatesSection() {
  return (
    <CatalogSection title="States">
      <StateView icon={Inbox} title="State view" description="Icon, title and description." />
      <Separator />
      <EmptyState />
      <Separator />
      <ErrorState error={new ApiError('network')} onRetry={() => undefined} />
      <Separator />
      <LoadingState />
    </CatalogSection>
  );
}
