# ReactNativeCoreBase

A reusable iOS and Android app core architecture built on **Expo SDK 57**, **React Native 0.86**, **React 19.2**, **TypeScript 6**, and **Expo Router**.

## Environment Prerequisites

- **Node.js**: `>=22.13` (tested on Node 22.13+)
- **npm**: Uses `package-lock.json` (`legacy-peer-deps=true` configured in `.npmrc`)
- **Native Toolchain**: Android Studio / SDK (JDK 17) for Android, Xcode (macOS) for iOS.

## Quick Start

```bash
npm ci
npm run verify
npm run start
```

Launch on device or emulator:

```bash
npm run android # Runs development build on Android (arm64)
npm run ios     # Runs development build on iOS simulator/device
```

## Available Scripts

- `npm run verify`: Runs full verification pipeline (`format:check`, `lint`, `typecheck`, `test`).
- `npm run format`: Formats code with Prettier and Tailwind plugin.
- `npm run lint`: Runs ESLint with architectural boundary validation.
- `npm run typecheck`: Runs strict TypeScript type-checking.
- `npm test`: Runs test suite with Jest and MSW.
- `npm run clean`: Cleans generated native directories, Metro caches, and build artifacts.
- `npm run init-project`: Customizes app name, bundle ID, slug, and optionally strips sample features (`--clean-samples`).

## App Identity & Configuration

The app has one identity: **CoreBase** (`dev.thanhng224.rncorebase`).

- **Display Name**: CoreBase
- **Android Package / iOS Bundle ID**: `dev.thanhng224.rncorebase`
- **URL Scheme**: `rncorebase`

Debug and Release share the same identity. Token refresh TTL defaults to 1 minute in `__DEV__` for rapid token refresh testing, and 30 minutes in production builds.

## Test Credentials

DummyJSON public auth backend is used for demonstration:

- **Username**: `emilys`
- **Password**: `emilyspass`
  _(Shown as a hint on the Sign In screen in `__DEV__` mode)._

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Engineering Conventions](docs/CONVENTIONS.md)
- [Adding a New Feature](docs/ADDING_A_FEATURE.md)
- [Verification Evidence](docs/VERIFICATION.md)
- [Upgrading](docs/UPGRADING.md)
- [Agent Guidelines & Invariants](AGENTS.md)

## Start Your Own Project

Copy this repository, then run:

```bash
npm run init-project -- --name "My App" --slug my-app --bundle-id com.example.myapp --scheme myapp --clean-samples
npm run format
npm run verify
```

Use `--dry-run` to preview changes. `--clean-samples` removes the auth/home demos and the dev-only UI catalog while keeping the API client, session, auth contract, preferences, Settings and every shared component. Regenerate native projects after changing app identity with `npx expo prebuild --clean`.

Then make it yours:

1. Replace the icon and splash assets in `assets/` and the colors in `app.config.ts`.
2. Adjust the theme tokens in `global.css` (keep text pairs at WCAG AA contrast).
3. Optionally load brand fonts with the `expo-font` config plugin.
4. Point `apiBaseUrl` (`app.config.ts`) at your backend and adapt `src/lib/auth/auth-contract.ts`
   (access + refresh token with Bearer auth; other auth models need their own design).

Left to each project on purpose: environments and build flavors, EAS Build/Submit and OTA updates, build numbering and signing, crash reporting (hook into `logger.error`), analytics and push notifications.

For local Release verification:

```bash
npx expo run:android --variant release
npx expo run:ios --configuration Release
```
