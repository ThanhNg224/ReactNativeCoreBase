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

- Create screens in `src/features/<feature-name>/screens/<screen-name>-screen.tsx`.
- Use existing components from `@/components/ui/` or `@/components/screen-container`.
- Use `useTranslation()` for copy.
- Fetch remote data using `@tanstack/react-query` with `apiRequest`.
- For form inputs, use `react-hook-form` and `zod`.

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
