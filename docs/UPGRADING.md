# Upgrading

Expo ships about three SDKs a year. Upgrade on purpose, one SDK at a time, on a branch.
Dependabot ignores Expo, React and React Native packages; they move only through this procedure.

## Expo SDK

1. Read the SDK release notes and the upgrade guide at https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/.
2. `npx expo install expo@^<N>.0.0`
3. `npx expo install --fix` aligns every Expo-managed native package (Reanimated, Worklets,
   Gesture Handler, Keyboard Controller, NetInfo, Screens, Safe Area, SVG, MMKV peers).
4. `npx expo-doctor` and `npx expo install --check` must pass.
5. Re-check peer conflicts without the escape hatch:
   `npm install --dry-run --legacy-peer-deps=false --ignore-scripts`. Remove `legacy-peer-deps`
   from `.npmrc` once the conflict listed in [CONVENTIONS.md](CONVENTIONS.md#dependencies) is gone.
6. Read the changelogs of the non-Expo UI dependencies: Uniwind, React Native Reusables /
   `@rn-primitives/*`, `sonner-native`, `react-native-keyboard-controller`.
7. `npm run verify`.
8. `npx expo prebuild --clean`, then build and run both platforms
   (`npx expo run:android`, `npx expo run:ios`) and walk the checklist in
   [VERIFICATION.md](VERIFICATION.md).
9. Update the versions in `AGENTS.md` (Invariants) and the Expo docs link, then record the run in
   `VERIFICATION.md`.

## React Native Reusables components

Components in `src/components/ui/` were added with
`npx @react-native-reusables/cli@latest add <name> --styling-library uniwind`. Re-adding with
`--overwrite` replaces local edits, so diff first. Local edits, kept minimal on purpose:

| File                             | Local change                                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`                     | Sizes 48/40/56/48 pt, `hitSlop` on `sm`, destructive text uses `destructive-foreground`                                                |
| `input.tsx`                      | 48 pt height                                                                                                                           |
| `text.tsx`                       | Removed web-document styles (`h1` centering, `h2` border, paragraph margins)                                                           |
| `select.tsx`                     | 48 pt trigger for both sizes and items, `text-base` items, conditional `hostName` spread                                               |
| `checkbox.tsx`                   | `hitSlop` around the 16 pt visual control; labelled controls use a 48 pt pressable row                                                 |
| `switch.tsx`                     | Mobile size (52×32) with `hitSlop`                                                                                                     |
| `badge.tsx`                      | Destructive text uses `destructive-foreground`                                                                                         |
| `dialog.tsx`, `alert-dialog.tsx` | 24 pt overlay margin, full-width alert dialog, `variant` on `AlertDialogAction`, conditional `hostName` spread, close button `hitSlop` |
| `skeleton.tsx`, `textarea.tsx`   | Strict TypeScript fixes; textarea uses `placeholderTextColorClassName`                                                                 |

`list.tsx` is local (no RNR equivalent).

## Theme tokens

RNR components expect the shadcn token set (`background`, `card`, `popover`, `primary`,
`secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring` and their
`-foreground` pairs). When a new component uses a token that `global.css` lacks, add it for both
themes and check contrast (AA, at least 4.5:1 for text).
