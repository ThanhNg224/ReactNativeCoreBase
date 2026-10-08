# Guide: Adding a New Feature

This checklist guides you through adding a new feature cleanly, preserving architectural boundaries.

## Step-by-Step Checklist

### 1. Create Feature Directory

Create `src/features/<feature-name>/`:

```bash
mkdir -p src/features/profile/{screens,components,api}
```

### 2. Define Translations

Add translation strings in both `src/lib/i18n/locales/en.json` and `src/lib/i18n/locales/vi.json`:

```json
"profile": {
  "title": "User Profile",
  "bio": "Bio"
}
```

### 3. Build UI & Logic

- Create screens in `src/features/<feature-name>/screens/<screen-name>-screen.tsx` and wrap them
  in `Screen` (`title`, and a `footer` for the primary action).
- Build from `@/components/ui/*`, `ListSection`/`ListItem`, `StateView`/`ErrorState` and
  `Skeleton`; check the dev-only UI catalog (Settings → Developer) for what exists.
- Use `useTranslation()` for copy.
- Fetch remote data with `@tanstack/react-query` and `apiRequest`; treat `fetchStatus === 'paused'`
  as offline, not loading.
- Forms use `FormField` with `react-hook-form` and `zod`.
- A picker or short choice opens a sheet route (see ARCHITECTURE §6) rendering `OptionSheet`.

```tsx
export function ProfileScreen() {
  const { t } = useTranslation();
  const query = useQuery(profileQuery());
  return (
    <Screen title={t('profile.title')}>
      {query.isPending && query.fetchStatus === 'fetching' ? <Skeleton className="h-24" /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data ? (
        <ListSection>
          <ListItem title={t('profile.bio')} value={query.data.bio} />
        </ListSection>
      ) : null}
    </Screen>
  );
}
```

### 4. Export Public API

In `src/features/<feature-name>/index.ts`, only export the screens or items needed by routes:

```ts
export { ProfileScreen } from './screens/profile-screen';
```

> [!IMPORTANT]
> Never export or deep-import internal components across features.

### 5. Mount the Route

Create or link the route in `src/app/`:

```tsx
// src/app/(app)/profile.tsx
export { ProfileScreen as default } from '@/features/profile';
```

### 6. Verify Architectural Integrity

Run the verification pipeline to ensure no lint, type, or boundary violations:

```bash
npm run verify
```
