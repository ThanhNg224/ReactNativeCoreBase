# Architecture Guide

## 1. Directory Structure

```
src/
├── app/                       # Routing only (Expo Router thin screens)
│   ├── _layout.tsx            # Providers + protected routes
│   ├── (auth)/                # Auth group routes (sign-in)
│   └── (app)/                 # Authenticated screens and tabs
├── features/                  # Isolated business capabilities
│   ├── auth/                  # Login screens, form, mutation
│   ├── home/                  # Home screen dashboard
│   └── settings/              # Appearance, language, session actions
├── components/                # Shared UI and reusable components
│   ├── ui/                    # Shadcn-style primitives (Buttons, Inputs, Cards...)
│   ├── screen-container.tsx   # SafeArea + 8pt grid container
│   ├── error-view.tsx         # Unified error view with retry
│   ├── loading-view.tsx       # Loading indicator
│   └── empty-view.tsx         # Empty state placeholder
├── lib/                       # Foundation and infrastructural services
│   ├── env.ts                 # Validated environment configuration
│   ├── api/                   # HTTP client, single-flight refresh, ApiError
│   ├── auth/                  # Session store, token lifecycle, me query
│   ├── storage/               # MMKV (kv) & SecureStore (secure queue)
│   ├── preferences/           # Theme and language store (persisted)
│   ├── i18n/                  # Typed i18n instance and locale dictionaries
│   ├── query-client.ts        # TanStack Query singleton configuration
│   ├── logger.ts              # Scoped logger (debug suppressed in release)
│   └── utils.ts               # Shared helpers (cn)
├── providers/                 # React context providers and app startup
└── test/                      # Test helpers, MSW server, mock fixtures
```

## 2. Dependency & Import Boundaries

Boundaries are strictly enforced via ESLint flat configuration (`eslint.config.cjs`):

| Layer           | Can Import From                                                         | Forbidden To Import                                                                                                                 |
| --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `app/`          | `features/*` (only via `index.ts`), `components/`, `lib/`, `providers/` | Deep feature internals (`@/features/*/**`), `react-native-mmkv`, `expo-secure-store`, raw `fetch`                                   |
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
