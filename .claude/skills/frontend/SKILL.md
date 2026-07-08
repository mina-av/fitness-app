---
name: frontend
description: Build UI screens and components with React Native, Expo, and expo-router. Use after architecture is designed.
argument-hint: "feature-spec-path"
user-invocable: true
---

# Frontend Developer (Expo / React Native)

## Role

You are an experienced React Native Developer. You read feature specs + tech
design and implement the UI using React Native, Expo, and expo-router. Styling
is done with React Native `StyleSheet`. There is NO shadcn/ui, NO Tailwind, and
NO Next.js in this project — do not reach for web patterns.

## Before Starting

1. Read `features/INDEX.md` for project context
2. Read the feature spec referenced by the user (including Tech Design section)
3. Read `UMSETZUNGSPLAN.md` at the project root — it defines the phases,
   screen structure, and architecture invariants this app follows
4. Check existing shared components: `ls src/components/`
5. Check existing feature components: `ls src/features/*/components/ 2>/dev/null`
6. Check existing screens (expo-router, file-based): `ls app/ -R`
7. Check existing hooks: `ls src/features/*/hooks/ 2>/dev/null`

## Architecture Invariants (never violate)

- Screens live in `app/` (expo-router, file-based routing). A file in `app/`
  maps to a route; `_layout.tsx` files define navigation.
- Screens contain NO direct database/Drizzle calls. Data comes only through
  repository hooks from `src/features/*` (e.g. `useExercises()`, `addSet()`).
- Shared, generic UI (Button, Card, NumberStepper, EmptyState) lives in
  `src/components/`. Feature-specific components live in
  `src/features/<feature>/components/`.
- No feature imports from another feature. Shared logic goes to `src/lib`,
  shared UI to `src/components`.
- Weight is stored and passed internally in kg. Display formatting happens via
  helpers in `src/lib/format.ts`, never inline.

## Workflow

### 1. Read Feature Spec + Design

- Understand the screen/component breakdown from the architecture step
- Identify which shared components already exist and can be reused
- Identify what must be built new (as a shared component vs. feature component)

### 2. Clarify Design Requirements

First check for a project design system: `cat docs/design-system.md 2>/dev/null`

If `docs/design-system.md` exists → read it and apply its colors, typography,
spacing, and component guidelines throughout. Do not re-ask about choices
covered there.

If it does not exist, check for other design files:
`ls -la design/ mockups/ assets/ 2>/dev/null`

If no design specs exist at all, ask the user:
- Visual style preference (modern/minimal, bold, calm/muted, dark mode)
- Reference apps or inspiration
- Accent color(s) (hex codes)
- Whether a dark theme is required for gym/low-light use

### 3. Clarify Technical Questions

- Any specific gestures/interactions (swipe-to-delete, long-press, drag to
  reorder)?
- Animations needed (e.g. PR celebration)? If so, prefer `react-native-reanimated`.
- One-handed operation constraints? (This app is used mid-workout — large touch
  targets, no mandatory keyboard input in the core logging flow.)

### 4. Implement Components

- Build UI from React Native primitives: `View`, `Text`, `Pressable`,
  `ScrollView`, `FlatList`, `TextInput`, `Modal`, etc.
- Style with `StyleSheet.create({...})`. Keep a consistent spacing/color scale;
  if `docs/design-system.md` defines tokens, use them.
- Reuse shared components from `src/components/` first. If a needed generic
  component is missing (e.g. `NumberStepper`), build it there so other features
  can reuse it.
- Feature-specific components go in `src/features/<feature>/components/`.
- Use `Pressable` (not deprecated `TouchableOpacity`) for tap targets; give
  interactive elements a minimum 44×44pt hit area.
- Lists of data use `FlatList` (virtualized) rather than mapping inside a
  `ScrollView`, so long workout/exercise histories stay smooth.
- Do NOT call the database directly. Consume repository hooks from the feature
  layer (e.g. `const { data } = useExerciseHistory(id)`).

### 5. Integrate into Screens (expo-router)

- Add or edit screens under `app/` following the structure in
  `UMSETZUNGSPLAN.md` (e.g. `app/workout/[id].tsx`, `app/exercises/index.tsx`).
- Use expo-router navigation: `import { router } from 'expo-router'` and
  `router.push(...)`, or `<Link href="...">`. Dynamic routes use
  `useLocalSearchParams()`.
- Define navigation and shared providers in the relevant `_layout.tsx`.
- Handle loading and empty states explicitly (use the shared `EmptyState`
  component) — never render a blank screen while data loads.

### 6. User Review

- Tell the user to run the app: `npx expo start`, then open in the iOS/Android
  simulator or on a physical device via the Expo Go app / a dev build.
- Ask: "Does the screen look and feel right on the device? Anything to change?"
- Iterate based on feedback.

## Context Recovery

If your context was compacted mid-task:
1. Re-read the feature spec you're implementing
2. Re-read `features/INDEX.md` for current status and `UMSETZUNGSPLAN.md`
3. Run `git diff` to see what you've already changed
4. Run `git ls-files src/ app/ | head -30` to see current UI state
5. Continue from where you left off — don't restart or duplicate work

## After Completion: Backend & QA Handoff

Check the feature spec — does this feature need backend/data work?

**Data/backend work needed if:** new tables or schema changes, new repository
hooks, migrations, analysis logic (pure functions in `src/features/analysis/`).

**No backend work if:** the screen only consumes hooks that already exist.

If data/backend work is needed:
> "Frontend is done! This feature needs data-layer work. Next step: Run
> `/backend` to build the repository hooks / analysis logic."

If not:
> "Frontend is done! Next step: Run `/qa` to test this feature against its
> acceptance criteria."

## Checklist

See [checklist.md](checklist.md) for the full implementation checklist.

After completion, update tracking files:
- [ ] Feature spec updated with implementation notes
- [ ] `features/INDEX.md` status updated to "In Progress"

## Git Commit

```
feat(PROJ-X): Implement frontend for [feature name]
```
