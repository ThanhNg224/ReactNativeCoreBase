# Architecture Guide

## 1. Directory Structure

```
src/
├── app/                       # Routing only (Expo Router thin screens)
│   ├── _layout.tsx            # Providers, protected routes, error boundary
│   ├── (auth)/                # Auth group routes (sign-in)
│   └── (app)/                 # Authenticated stack: tabs, sheet routes, dev-only UI catalog
├── features/                  # Isolated business capabilities
│   ├── auth/                  # Sign-in screen, form, mutation
│   ├── home/                  # Profile dashboard
│   ├── settings/              # Preference rows, appearance/language sheets, sign-out
│   └── ui-catalog/            # Debug-only component gallery (removed by --clean-samples)
├── components/                # Shared UI
│   ├── ui/                    # React Native Reusables primitives + list.tsx
│   ├── screen.tsx             # Screen frame: safe areas, title, keyboard, sticky footer
│   ├── state-view.tsx         # Empty / error / offline / loading states
│   ├── form-field.tsx         # react-hook-form field: label, control, error
│   ├── option-sheet.tsx       # Content for a fitToContents picker sheet
│   ├── toaster.tsx            # Themed sonner-native host (mounted once)
│   └── app-error-boundary.tsx # Root render-error fallback
├── lib/                       # Foundation services
│   ├── env.ts                 # Validated config (apiBaseUrl, HTTPS in Release)
│   ├── api/                   # HTTP client, single-flight refresh, ApiError
│   ├── auth/                  # auth-contract.ts (backend shapes), session, me query
│   ├── storage/               # MMKV (kv) and SecureStore (secure queue)
│   ├── preferences/           # Theme and language store (persisted)
│   ├── i18n/                  # languages.ts registry, typed i18n, locale JSON
│   ├── query-client.ts        # TanStack Query client, focus + NetInfo online wiring
│   ├── use-is-online.ts       # Connectivity hook for UI
│   ├── toast.ts               # The only toast entry point for features
│   ├── logger.ts              # Scoped logger; logger.error is the crash-reporting hook
│   └── utils.ts               # cn()
├── providers/                 # App providers, startup, navigation theme
└── test/                      # Test helpers, MSW server, cross-feature tests
```

## 2. Dependency & Import Boundaries

Boundaries are strictly enforced via ESLint flat configuration (`eslint.config.cjs`):

| Layer           | Can Import From                                                         | Forbidden To Import                                                                                                                 |
| --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `app/`          | `features/*` (only via `index.ts`), `components/`, `lib/`, `providers/` | Deep feature internals (`@/features/*/**`), `react-native-mmkv`, `expo-secure-store`, `sonner-native`, raw `fetch`                  |
| `features/<f>/` | `components/`, `lib/`                                                   | Other features (`@/features/<other>/**`), `app/**`, `providers/**`, storage packages, raw `fetch`, inline style objects, hex colors |
| `components/`   | `lib/`                                                                  | `features/**`, `app/**`, `providers/**`, storage packages, raw `fetch`                                                              |
| `lib/storage/`  | Pure storage packages (`MMKV`, `SecureStore`)                           | `features/**`, `components/**`, `app/**`, `providers/**`                                                                            |
| `lib/api/`      | `fetch` API, `lib/env`, `lib/auth/session`                              | `features/**`, `components/**`, `app/**`, storage packages                                                                          |
| Other `lib/`    | Other `lib/` modules                                                    | `features/**`, `components/**`, `app/**`, storage packages, raw `fetch`                                                             |
| `providers/`    | `lib/**`, `components/**`                                               | `features/**`, `app/**`, storage packages, raw `fetch`                                                                              |

### Why `lib/auth/` Exists Outside `features/auth/`

Features are strictly isolated from one another. Both `features/home` and root layout routing need user profile information and session status. To prevent cross-feature coupling between `home` and `auth`, session management (`session.ts`) and the shared profile query (`me-query.ts`) are placed in `lib/auth/`.

## 3. Session & Refresh Lifecycle

```
[ Incoming Request (auth: true) ]
              │
              ▼
        [ Call API ] ─── 2xx ───► [ Return Response ]
              │
             401
              │
              ▼
   [ Single-Flight refreshSession() ]
              │
  ┌───────────┼──────────────────────────┬──────────────────────────┐
  │           │                          │                          │
 2xx       400/401/403              Network/Timeout/5xx           Stale
  │           │                          │                          │
  ▼           ▼                          ▼                          ▼
Save new   signOut('expired')       Keep session;             Epoch changed;
tokens;    Throw Unauthorized        bubble error              discard request;
Replay 1x                           (retryable)               throw Cancelled
  │
  ├── 2xx ──► Return
  └── 401 ──► signOut('expired') & throw Unauthorized
```

### Epoch Fencing

An in-memory `sessionEpoch` increments on every sign-in and sign-out. All asynchronous operations (hydration, token refresh, background profile updates) record the starting epoch. If the epoch has changed when the operation completes, results are discarded immediately to eliminate race conditions.

## 4. Backend Contract

`src/lib/auth/auth-contract.ts` holds everything specific to the backend: the app's internal
`SessionUser`/`SessionTokens` models, login/refresh/me request builders, response schemas that
transform the backend shape into those models, refresh reject statuses and the token TTL.

Switching to a backend with the same model (access + refresh token, `Authorization: Bearer`)
means editing this file and `apiBaseUrl` in `app.config.ts`. The Bearer header, POST refresh and
single-flight logic stay in `lib/api`. A different sign-in UI (email, OTP) still changes
`features/auth`. Other auth models (cookies, OAuth/PKCE) are a project decision.

## 5. Providers

`AppProviders` nests, outermost first: `GestureHandlerRootView` → `KeyboardProvider` →
`QueryClientProvider` → `I18nextProvider` → `ThemeProvider` (React Navigation theme built from
the CSS tokens) → screens, then `PortalHost` and `Toaster`. Theme changes are applied
synchronously from the preferences store so UI rendered in the same update uses the new tokens.

## 6. Screens, Sheets and Network State

- **`Screen`** owns safe areas. Top/left/right always; bottom only outside tabs (the tab layout
  passes `TabScreenLayout` as `screenLayout`, and the tab bar reserves the inset). A `footer`
  holds primary actions: it sits below the scroll view, clears the bottom inset itself, and
  floats on the keyboard via `KeyboardStickyView`; the scroll view's `bottomOffset` keeps the
  focused input above the footer.
- **Sheets** are routes in the `(app)` stack with `presentation: 'formSheet'` and
  `sheetAllowedDetents: 'fitToContents'`. Sheet screens render natural-height content
  (`OptionSheet`), never `Screen` or a `flex-1` container. Long scrolling sheets need fixed
  detents (see the React Navigation native-stack form sheet notes).
- **Network modes**: queries use `networkMode: 'online'` and pause offline (`fetchStatus:
'paused'` is not loading; screens keep cached data and show an offline notice). Mutations use
  `'always'` and fail fast with `ApiError('network')`. Offline mutation queues are a project
  decision.
- **Debug-only routes** sit inside `<Stack.Protected guard={__DEV__}>`, which removes them from
  navigation in Release. `ui-catalog:start`/`ui-catalog:end` markers let `init-project` strip the
  catalog.
