# Data-Layer Implementation Checklist (Expo · SQLite · Drizzle)

## Core Checklist

- [ ] Read current `src/db/schema.ts` and existing hooks before adding new ones.
- [ ] Any new table/column follows the conventions: UUID `id`, `createdAt`,
      `updatedAt`, `deletedAt` (soft delete).
- [ ] Indexes added on columns used for filtering/sorting (esp. the
      `(exerciseId, createdAt)` history path).
- [ ] Foreign keys reference the right parent tables.
- [ ] Migration generated with drizzle-kit and runs automatically on app start.
- [ ] Repository hooks created in `src/features/<feature>/hooks/`.
- [ ] Every read query filters out soft-deleted rows (`deletedAt IS NULL`).
- [ ] Writes set `updatedAt`; "deletes" set `deletedAt` (never hard DELETE).
- [ ] New rows get a UUID via `expo-crypto`.
- [ ] Analysis logic lives in `src/features/analysis/` as pure functions
      (no `src/db` import, no React).
- [ ] Warmup sets excluded from volume, PRs, and recommendations.
- [ ] No screen accesses the database directly — only through hooks.
- [ ] No secrets/keys in source (this app has none server-side anyway).
- [ ] UI connected to the real hooks (no mock data left).

## Verification (run before marking complete)

- [ ] `npm run check` (typecheck + lint) passes.
- [ ] `npm test` passes.
- [ ] Tests cover: create, update, soft delete (row stays, is hidden),
      `updatedAt` refresh.
- [ ] Analysis tests cover every rule (positive + negative) and edge cases:
      empty week, only warmups, first-ever week, exercise with no history.
- [ ] App relaunch does not lose data (persistence works).
- [ ] `features/INDEX.md` status updated to "In Progress".
- [ ] Code committed to git.

## Performance / Robustness Checklist

- [ ] Frequently filtered/sorted columns are indexed.
- [ ] Related data loaded via Drizzle relations/joins, not many small queries
      in a loop.
- [ ] List queries are bounded where it makes sense (e.g. recent workouts).
- [ ] Analysis functions handle empty/partial data without crashing.
- [ ] `src/sync/` left empty (reserved for a future Supabase sync).
