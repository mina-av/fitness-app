# Frontend Implementation Checklist (Expo / React Native)

Use this checklist for every UI feature. Check each item before handing off to QA.

## Structure & Architecture

- [ ] Screens live in `app/` (expo-router); dynamic routes use
      `useLocalSearchParams()`.
- [ ] No screen contains direct Drizzle/SQLite calls — data comes only via
      repository hooks from `src/features/*`.
- [ ] Generic, reusable UI is in `src/components/`; feature-specific UI is in
      `src/features/<feature>/components/`.
- [ ] No feature imports from another feature (shared code → `src/lib` /
      `src/components`).
- [ ] File/folder names match `UMSETZUNGSPLAN.md`.

## Components & Styling

- [ ] Built from React Native primitives (`View`, `Text`, `Pressable`,
      `FlatList`, `TextInput`, `Modal`, …).
- [ ] Styled with `StyleSheet.create` (no inline style objects for anything
      reused; no web CSS).
- [ ] Colors, spacing, and typography follow `docs/design-system.md` if present.
- [ ] Long lists use `FlatList` (virtualized), not `.map()` inside a
      `ScrollView`.
- [ ] Interactive elements use `Pressable` with a ≥44×44pt hit area.

## UX (gym-context specific)

- [ ] Core logging actions are one-handed and reachable with the thumb.
- [ ] No mandatory keyboard input in the core "log a set" flow (steppers/chips
      instead).
- [ ] New set is pre-filled with the previous set's values.
- [ ] "Last time: 3×8 @ 80 kg" (and target from template, if any) is shown.
- [ ] Loading states shown while hooks resolve; no blank screens.
- [ ] Empty states use the shared `EmptyState` component with a clear call to
      action.

## Data & State

- [ ] Weights handled in kg internally; display formatted via
      `src/lib/format.ts`.
- [ ] Dates/weeks handled via `src/lib/dates.ts` (ISO week, Mon–Sun).
- [ ] Optimistic UI where it helps responsiveness; errors surfaced to the user.
- [ ] No `localStorage`/web storage APIs — persistent data goes through the
      SQLite repository layer.

## Accessibility & Robustness

- [ ] Text scales reasonably with OS font-size settings.
- [ ] Sufficient color contrast, especially for a dark/low-light theme.
- [ ] `accessibilityLabel` set on icon-only buttons.
- [ ] Invalid/missing data (e.g. broken media URL, exercise without history)
      renders a fallback instead of crashing.

## Verification

- [ ] `npm run check` (typecheck + lint) passes.
- [ ] App runs via `npx expo start` and the feature works in the simulator or on
      a device.
- [ ] Manually walked the primary user flow end-to-end.
- [ ] Component tests added where logic warrants (e.g. `NumberStepper` bounds).

## Handoff

- [ ] Feature spec updated with implementation notes.
- [ ] `features/INDEX.md` status updated to "In Progress".
- [ ] Commit made: `feat(PROJ-X): Implement frontend for [feature name]`.
