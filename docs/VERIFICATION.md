# Verification

Verified locally on 2026-10-08 after the UI kit, auth contract, i18n registry and offline work.
This records observed results, not a claim that every device, backend or dependency is covered.

## Source and template gates

| Command / check                                                                                  | Result                                                                                             |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `npm run verify`                                                                                 | PASS: formatting, ESLint (boundaries, React Compiler), strict TypeScript, 14 suites / 113 tests.   |
| `npx expo install --check`                                                                       | PASS: dependencies match SDK 57.                                                                   |
| `npx expo-doctor`                                                                                | PASS: 21/21 checks.                                                                                |
| `CI=1 npx expo export --platform all`                                                            | PASS: production Hermes bundles for Android and iOS.                                               |
| `init-project --name "Demo App" … --clean-samples` on a copy, then `npm run format` and `verify` | PASS: 11 suites / 100 tests (after making marker stripping idempotent for already-cleaned copies). |
| Theme token contrast (all text/background pairs, both themes)                                    | PASS: every pair at least 4.5:1 (lowest: light `success`/`warning` on `muted`, 4.58:1).            |

Tests cover, in addition to the earlier API/session/refresh/boundary/initializer suites: the auth
contract transforms and TTL, every registered locale having English's keys, NetInfo driving the
online manager, queries pausing offline and resuming on reconnect, mutations failing fast offline,
sign-in offline (network error, submit re-enabled), Home offline (cached profile, offline notice,
no loading state, refresh on reconnect), settings rows opening sheets, sheet selections updating
preferences and language, and sign-out confirmation. Catalog tests check named controls, one
focusable control per row, and checked-state changes. The initializer regression registers a third
locale and verifies key parity after removing samples.

## Android device

Samsung SM-N770F (Android 13, arm64), Debug build with Metro, then Release APK
(`./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a`, bundled JavaScript)
installed over it.

- Sign-in: footer button stays above the keyboard; focusing the password field keeps it above the
  footer; empty submit shows both validation messages with the button visible; sign-in succeeds.
- Home: profile with avatar and list rows; long email truncates instead of squeezing the label.
  Wi-Fi off + pull-to-refresh shows the offline notice with cached data and the spinner stops;
  Wi-Fi on removes the notice. Wi-Fi was re-enabled after the test.
- Settings: appearance and language sheets open as native `fitToContents` sheets; Light/Dark and
  English/Vietnamese apply immediately with a toast in the new theme/language; sign-out asks for
  confirmation, and Back after sign-out leaves the app instead of returning to the tabs.
- Tab bar, headers and backgrounds follow the theme tokens in light and dark.
- UI catalog (Debug): typography, buttons, form controls, select (portal), alerts, badges,
  skeletons, toasts, dialog, alert dialog, avatar, card, list and states render in dark mode.
  Fixed during this pass: missing `popover` tokens, dark `muted` equal to `card` (invisible
  skeleton/avatar fallback), narrow alert dialog, toast colors during a theme switch, toast
  position over the tab bar.
- Release: no development menu or demo hint, preferences persist, sign-in works, the Developer
  section is absent and `rncorebase://ui-catalog` does not open the catalog.

The Release APK was left installed after that check.

This Android runtime record predates the final touch-target, accessibility and locale-cleanup
fixes. The source gates above were rerun after those fixes.

## iOS compilation

Xcode 27.0 (27A266a), iOS Simulator SDK 27.0. A fresh iOS project was generated after the final
review fixes; CocoaPods installed 116 pods. The unsigned arm64 Release build passed, including
native dependencies and bundled JavaScript:

```bash
CI=1 npx expo prebuild --platform ios
xcodebuild -workspace ios/CoreBase.xcworkspace -scheme CoreBase -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build \
  ARCHS=arm64 ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO
```

Generated native projects and export outputs were removed after verification.

## Not verified in this pass

- iOS launch and UI interaction (sheets, keyboard/footer, dialogs and toasts) remain unverified.
  The installed Xcode toolchain has SDKs but no `Simulator.app` or available simulator runtime.
  The build above proves compilation and bundling; it does not prove runtime behavior.
- For results on the pushed commit, see [GitHub Actions](https://github.com/ThanhNg224/ReactNativeCoreBase/actions).
  CI's iOS job builds unsigned and only proves compilation.
- No production backend, App Store / Play signing, or physical iOS device.

## Dependency advisories

`npm audit` reports 61 advisories (16 moderate, 45 high); `npm audit --omit=dev` reports 25
(11 moderate, 14 high), unchanged from the previous pass. They come from transitive Expo/native
build tooling; several have no patched release or require leaving the SDK 57 line. No forced
downgrade or unverified override was applied. Review them on each SDK upgrade
([UPGRADING.md](UPGRADING.md)).

## Peer dependencies

`npm install --dry-run --legacy-peer-deps=false` resolves except one conflict: `react-reconciler@0.34`
(Testing Library's `test-renderer`) and the optional `react-dom@19.3` peer require React 19.3,
while SDK 57 pins React 19.2.3. `legacy-peer-deps` stays until an SDK upgrade removes it.
