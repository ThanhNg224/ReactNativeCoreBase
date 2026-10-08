# ReactNativeCoreBase

## Source of truth

- `docs/ARCHITECTURE.md`: directory structure, boundary matrix, session & refresh lifecycle.
- `docs/CONVENTIONS.md`: kebab-case naming, ApiError, i18n, styling tokens, query state.
- `docs/ADDING_A_FEATURE.md`: step-by-step checklist for new features.
- `docs/VERIFICATION.md`: verification commands, evidence, and limitations.
- `docs/UPGRADING.md`: SDK upgrade procedure and the list of locally modified RNR components.

## Invariants

- Expo SDK 57, React Native 0.86, React 19.2, TypeScript ~6.0, Node >=22.13; npm lockfile.
- One app identity: CoreBase (`dev.thanhng224.rncorebase`), no APP_ENV or flavors.
- iOS and Android only, New Architecture, Expo CNG. Never commit `android/` or `ios/`.
- Work on the current branch. Do not create branches or worktrees unless requested.
- Tokens reside strictly in module memory and Keychain/Keystore via `lib/storage/secure.ts`, never in MMKV or logs.
- Cross-feature imports are forbidden by ESLint; shared abstractions belong in `lib/` or `components/`.
- UI stack: Uniwind + React Native Reusables (`components/ui`), Reanimated 4 + Worklets, Gesture
  Handler, Keyboard Controller, sonner-native (only via `lib/toast`), NetInfo. Screens use
  `Screen`; touch targets are at least 48 pt; colors come from `global.css` tokens.
- Backend-specific shapes live only in `src/lib/auth/auth-contract.ts`.
- Environments, flavors, EAS/OTA, signing and crash-reporting vendors are project decisions;
  do not add them to the base.
- Do not use global `URL`, `URLSearchParams`, `TextEncoder`, `TextDecoder`, `crypto`,
  or `AbortSignal.timeout` / `AbortSignal.any` in app code.
- Install native packages with `npx expo install`; declare required peers explicitly
  because `.npmrc` uses `legacy-peer-deps=true`.
- Ask before changing an approved design decision. Commit and push only when authorized.

## Build & verify

- `npm run verify`: formatting, ESLint (including React Compiler), TypeScript, Jest.
- Visual changes: focused formatting/static checks. Behavior changes: focused tests.
  Native/config plugin changes: regenerate and build on the target platform.
- `npx expo install --check` and `npx expo-doctor`: native dependency compatibility.
- `npx expo run:android`: development client, arm64 only by the config plugin.
- `npx expo run:ios`: development client (simulator or configured physical device).
- `npm run clean`: removes only generated projects, caches, bundles, and coverage.
- Local builds are the default. Expo Skills and Expo MCP may be enabled at project scope.

## Versioned documentation

Read the Expo version in `package.json` before changing native APIs; use the matching documentation at https://docs.expo.dev/versions/v57.0.0/. Install Expo-managed packages with `npx expo install`. This project uses npm and requires its lockfile.
