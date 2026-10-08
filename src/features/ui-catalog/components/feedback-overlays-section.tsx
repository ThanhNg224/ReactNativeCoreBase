import { CircleAlert, Info } from 'lucide-react-native';
import { View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { toast } from '@/lib/toast';
import { CatalogSection } from './catalog-section';

const BADGE_VARIANTS = ['default', 'secondary', 'destructive', 'outline'] as const;

export function FeedbackSection() {
  return (
    <CatalogSection title="Feedback">
      <Alert icon={Info}>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>This is a default alert.</AlertDescription>
      </Alert>
      <Alert icon={CircleAlert} variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>This is a destructive alert.</AlertDescription>
      </Alert>
      <View className="flex-row flex-wrap gap-2">
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant}>
            <Text>{variant}</Text>
          </Badge>
        ))}
      </View>
      <View className="gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="size-12 rounded-full" />
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button variant="outline" onPress={() => toast('Message')}>
          <Text>Toast</Text>
        </Button>
        <Button variant="outline" onPress={() => toast.success('Saved')}>
          <Text>Success</Text>
        </Button>
        <Button variant="outline" onPress={() => toast.error('Failed')}>
          <Text>Error</Text>
        </Button>
      </View>
    </CatalogSection>
  );
}

export function OverlaysSection() {
  return (
    <CatalogSection title="Overlays">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Text>Open dialog</Text>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description goes here.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>
                <Text>Close</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <Text>Open alert dialog</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive">
              <Text>Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CatalogSection>
  );
}
