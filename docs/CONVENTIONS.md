# Engineering Conventions

## 1. Naming & File Conventions

- Use **kebab-case** for all file and directory names (e.g. `sign-in-screen.tsx`, `use-startup.ts`, `api-error.ts`).
- Co-locate unit and integration tests next to the code under test (`*.test.ts(x)`).

## 2. Error Handling & User Copy

- All API exceptions are represented by `ApiError` with a specific `kind`:
  `'network' | 'timeout' | 'cancelled' | 'unauthorized' | 'forbidden' | 'notFound' | 'validation' | 'server' | 'invalidResponse'`.
- Convert errors to translation keys using `errorMessageKey(error)`.
- Render user errors using `<ErrorView error={error} onRetry={refetch} />`.

## 3. Internationalization (i18n)

- Use `useTranslation()` or `i18n.t()`.
- Group translation keys by feature namespace: `common.*`, `errors.*`, `auth.*`, `settings.*`, `home.*`.
- English (`en.json`) is the type source of truth. TypeScript validates all translation keys at compile time.

## 4. Styling & Design System

- Use **Uniwind** Tailwind classes with semantic design tokens defined in `global.css` (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, etc.).
- Avoid inline `style={{ ... }}` and raw hex color literals (`#fff`) in features.
- Merge class names with `cn(...)` from `@/lib/utils`.
- Add new reusable UI components using the React Native Reusables CLI:
  ```bash
  npx @react-native-reusables/cli@latest add <component> --styling-library uniwind
  ```

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
- Never use Jest snapshot tests (`toMatchSnapshot`). Test visible elements and accessible roles.

## 7. App Identity & Build Configuration

- Single app identity: **CoreBase** (`dev.thanhng224.rncorebase`), scheme `rncorebase`.
- Debug and Release share the identical identity, avoiding build flavor sprawl.
- Debug runs with a 1-minute access token TTL to test refresh behavior. Release uses 30 minutes.
- Release builds mandate HTTPS API URLs via `lib/env.ts` validation.

## Formatting from a clean install

Use `npm run format` and `npm run format:check`. Their pre-hooks generate Uniwind theme artifacts before Prettier sorts classes, so a fresh `npm ci` uses the same class order as a Metro build. After changing theme tokens, run `npm run styles:generate` before using editor-only formatting.
