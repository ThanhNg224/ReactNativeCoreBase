# Verification

Verified locally on 2026-10-07. This records observed results, rather than a claim that every device, backend, or dependency is covered.

## Source and template gates

| Command / check                                                                                       | Result                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                                                                                      | PASS: formatting, ESLint, strict TypeScript, 11 suites / 98 tests; Jest exits normally. Independent fresh-install verification also passes; final initialization coverage includes 11 tests. |
| `npx expo install --check`                                                                            | PASS: dependencies are compatible with SDK 57.                                                                                                                                               |
| `npx expo-doctor`                                                                                     | PASS: 21/21 checks.                                                                                                                                                                          |
| Clean and rename a temporary copy, including the display name `Thanh's App`; format and verify        | PASS: 9 suites / 91 tests after removing auth/home samples.                                                                                                                                  |
| Follow `ADDING_A_FEATURE.md` to add an `about` screen, translations and route; verify, then remove it | PASS: 11 suites / 97 tests; removal also passes typecheck.                                                                                                                                   |
| Focused app-flow tests with Jest `--detectOpenHandles`                                                | PASS: 2 suites / 6 tests; process exits.                                                                                                                                                     |

Boundary regression tests cover aliases, relative imports and re-exports, cross-feature imports, storage access, source-root files, raw fetch and runtime globals. Initialization tests cover dry-run file preservation, cleaned-template typechecking and boundaries, quote/backslash escaping, literal `$&` preservation in README, repeat renaming, and invalid arguments.

## Native and device evidence

One identity is used by Debug and Release: `dev.thanhng224.rncorebase`, scheme `rncorebase`. Native projects are generated with `npx expo prebuild --clean --no-install` and are not committed.

Android: Samsung SM-N770F, Android 13 / API 33, arm64, physical device controlled directly with ADB.

- Debug: sign-in succeeds against the public DummyJSON backend. After the one-minute token TTL, Home refresh produces `/auth/me` 401, one unique `/auth/refresh` 200, then a successful replay. Only paths, status codes and request identifiers were inspected.
- Debug: cold start restores the signed-in profile. Offline pull-to-refresh displays a connection error and retains the session. Network settings were restored after the test.
- Debug: sign-out returns to Sign In; Android Back cannot return to the guarded tabs.
- Release: `./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a` passes with bundled JavaScript. The APK installs over the same package, opens without a development-client menu or Debug credential hint, signs in, and restores the session after force-stop/relaunch.

iOS: iPhone 17 Pro simulator, iOS 26.5, Xcode 27.0. `pod install` installs 109 pods. Release builds succeed, including an arm64 build with `ARCHS=arm64 ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=-`. This signed simulator build opens, signs in, and restores the session after terminate/relaunch. Dark theme and Vietnamese persist across relaunch; light/English are restored afterward. An unsigned simulator build lacks the Keychain entitlement and is suitable only for compilation checks; use the normal signed Expo command for runtime testing.

Local Release reproduction:

```bash
npx expo prebuild --clean
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

No iOS physical-device, App Store signing, or production backend validation is claimed. DummyJSON credentials are public sample credentials.

## CI

The workflow runs verification on pushes and pull requests, Android Release on pull requests and manual dispatch, and iOS simulator compilation on manual dispatch. iOS prebuild installs Pods before building the generated workspace. The first remote run revealed that a fresh Uniwind installation did not yet expose custom theme tokens to Prettier. Format pre-hooks now generate theme artifacts through the bundled Uniwind CLI before sorting. [Full manual run on `3c268fc`](https://github.com/ThanhNg224/ReactNativeCoreBase/actions/runs/37605315072) passes all three jobs: Verify, Android Release Build, and iOS Simulator Debug. [Verification on `17ca2ad`](https://github.com/ThanhNg224/ReactNativeCoreBase/actions/runs/37605912182) also passes after adding the 98th regression test. Later changes affect initialization tooling and this report; app sources, dependency lockfile, Expo config and native build inputs remain unchanged. Each subsequent push also runs verification.

## Dependency advisories

The SDK 57 dependency tree currently reports 61 advisories (16 moderate, 45 high); `npm audit --omit=dev` reports 25 (11 moderate, 14 high). These counts include transitive Expo/native build tooling and repeated affected parents; they do not measure 61 independent application flaws.

`braces`, `node-forge`, and `sprintf-js` have no patched registry release available at the time of this check. The `decode-uri-component` patch changes its module contract, while npm's proposed parent upgrade moves Expo Router outside the approved SDK 57 line. UUID advisory applicability depends on the consuming API. No forced Expo/React Native downgrade or unverified transitive override was applied. Review these upstream issues when upgrading the SDK; this repository does not claim a clean security audit.

- [decode-uri-component advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)
- [UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
- [node-forge advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv)

## Completion and cleanup

P0–P4 acceptance checks are complete. The optional P5 work was not requested. Generated native projects, Expo/build caches, temporary fixture copies and device captures have been removed. The development Metro process was stopped and the simulator started for testing was shut down. Installed app data on the physical Android device was preserved. Completed local plans and their superseded reports were deleted; `docs/plans/` remains ignored.

Both managed local Gradle workflows were finished successfully and removed only their wrapper-owned logs. Build question: **Does the completed single-app base build an arm64 Release APK with its bundled JavaScript?** Answer: **PASS**, including the final incremental build (62.478 seconds).
