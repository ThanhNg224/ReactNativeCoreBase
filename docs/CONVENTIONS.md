# Engineering Conventions

## 1. Naming & File Conventions

- Use **kebab-case** for all file and directory names (e.g. `sign-in-screen.tsx`, `use-startup.ts`, `api-error.ts`).
- Co-locate unit tests next to the code under test (`*.test.ts(x)`). Tests that span features or
  routes live in `src/test/`.

## 2. Error Handling & User Copy

- All API exceptions are represented by `ApiError` with a specific `kind`:
  `'network' | 'timeout' | 'cancelled' | 'unauthorized' | 'forbidden' | 'notFound' | 'validation' | 'server' | 'invalidResponse'`.
- Convert errors to translation keys using `errorMessageKey(error)`.
- Render user errors using `<ErrorState error={error} onRetry={refetch} />` from
  `@/components/state-view`; inline form or action errors use `<Alert variant="destructive">`.

## 3. Internationalization (i18n)

- Use `useTranslation()` or `i18n.t()`.
- Group translation keys by feature namespace: `common.*`, `errors.*`, `auth.*`, `settings.*`, `home.*`.
- English (`en.json`) is the type source of truth. TypeScript validates all translation keys at compile time.
- Languages are registered once in `src/lib/i18n/languages.ts` (resources and endonym label).
  Adding a language means one entry there plus one locale JSON; a test checks every registered
  locale has exactly English's keys.

## 4. Styling & Design System

- Use **Uniwind** Tailwind classes with semantic tokens from `global.css` (`bg-background`,
  `text-foreground`, `bg-primary`, `text-muted-foreground`, `text-success`, …). Never raw hex
  colors or inline `style` objects in features (ESLint-enforced). Shared components may use
  computed styles for safe-area insets.
- Merge class names with `cn(...)` from `@/lib/utils`.
- Add reusable primitives with the React Native Reusables CLI, then apply only touch-target and
  token fixes (record them in [UPGRADING.md](UPGRADING.md)):
  ```bash
  npx @react-native-reusables/cli@latest add <component> --styling-library uniwind
  ```

### UI rules

- Touch targets are at least 48 pt in actual hit area (size or `hitSlop`), not just visually.
  `hitSlop` is clipped by the parent: use a named, 48 pt pressable row for labelled checkboxes,
  switches and radio options, with the visual control hidden from accessibility and pointer events.
- Every screen uses `Screen` (title, scroll, keyboard, safe areas). Primary actions go in its
  `footer`, keeping them in the lower half of the screen. Exception: sheet routes render
  natural-height content (`OptionSheet`).
- Lists of settings or details use `ListSection`/`ListItem`; one focusable element per row.
- States: `Skeleton` for first load, `StateView`/`EmptyState`/`ErrorState` for empty and error,
  an offline `Alert` when a query is paused. Paused is not loading.
- Forms use `FormField` + react-hook-form + zod.
- Toasts go through `toast` from `@/lib/toast` (never `sonner-native` directly); destructive
  actions confirm with `AlertDialog` (`AlertDialogAction variant="destructive"`).
- Icons use `Icon` with lucide icons so they follow text color tokens.
- Brand fonts, icon and splash assets are per-project: replace assets, adjust tokens in
  `global.css`, and load fonts with the `expo-font` config plugin.

## 5. State Management Hierarchy

1. **Server State**: Managed via `@tanstack/react-query` v5 and factory `queryOptions`.
2. **Global Client State**: Use lightweight `zustand` stores. Only session (`useSessionStore`) and preferences (`usePreferencesStore`) belong in global client stores.
3. **Local Component State**: Standard React `useState` / `useReducer`.
4. **Forms**: Managed with `react-hook-form` + `@hookform/resolvers/zod`.

## 6. Testing Principles

- Focus on user behavior over implementation details.
- Mock external network requests with **MSW** (`msw/node`).
- Test routed screens with `renderRouter` from `expo-router/testing-library`.
- Tests use the shared QueryClient; `jest.setup.ts` disables cache GC timers and clears the cache after unmounting each render.
- Isolated screens render through `renderScreen` (safe area + `AppProviders`). Toasts are mocked;
  assert `toast.success(...)` calls. Drive connectivity with `onlineManager.setOnline(...)`.
- Never use Jest snapshot tests (`toMatchSnapshot`). Test visible elements and accessible roles.

## 7. App Identity & Build Configuration

- Single app identity: **CoreBase** (`dev.thanhng224.rncorebase`), scheme `rncorebase`.
- Debug and Release share the identical identity, avoiding build flavor sprawl.
- Debug runs with a 1-minute access token TTL to test refresh behavior. Release uses 30 minutes.
- Release builds mandate HTTPS API URLs via `lib/env.ts` validation.

## Formatting from a clean install

Use `npm run format` and `npm run format:check`. Their pre-hooks generate Uniwind theme artifacts before Prettier sorts classes, so a fresh `npm ci` uses the same class order as a Metro build. After changing theme tokens, run `npm run styles:generate` before using editor-only formatting.

## Dependencies

- Install native packages with `npx expo install` so versions match the SDK.
- `.npmrc` keeps `legacy-peer-deps=true` for one known conflict (checked 2026-10-08):
  `react-reconciler@0.34` (from `test-renderer`, used by Testing Library 14) and the optional
  `react-dom@19.3` peer require React 19.3, while SDK 57 pins React 19.2.3. Declare required
  peers explicitly, and re-check with `npm install --dry-run --legacy-peer-deps=false` on each
  SDK upgrade ([UPGRADING.md](UPGRADING.md)).
