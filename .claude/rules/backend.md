---
paths:
  - "src/db/**"
  - "src/features/*/hooks/**"
  - "src/features/analysis/**"
  - "drizzle/**"
  - "drizzle.config.*"
---

# Data-Layer Rules (Expo · SQLite · Drizzle)

This is an offline-first app. There is no server, no Supabase, no auth. All data
is local on the device. These rules govern the data layer.

## Schema & Storage

- Every table has: UUID `id` (TEXT), `createdAt`, `updatedAt` (unix-ms),
  `deletedAt` (nullable, for soft deletes).
- Generate UUIDs with `Crypto.randomUUID()` (`expo-crypto`). Never use
  auto-increment integers.
- Add indexes on columns used in WHERE / ORDER BY (the `sets` history query on
  `(exerciseId, createdAt)` is the most important one).
- Use foreign keys to keep relationships consistent.
- Store weights in kg (REAL). Format for display only in `src/lib/format.ts`.

## Reads & Writes (repository hooks)

- All database access lives in repository hooks under
  `src/features/<feature>/hooks/`. Screens never query the DB directly.
- Every read filters out soft-deleted rows (`deletedAt IS NULL`).
- On insert: set a UUID, `createdAt`, `updatedAt`.
- On update: always refresh `updatedAt`.
- On delete: set `deletedAt` (soft delete). Never hard-delete.
- Load related rows with Drizzle relations/joins, not N+1 loops.

## Analysis Logic

- All calculations (volume, 1RM, PRs, trends, recommendations) live in
  `src/features/analysis/` as PURE functions.
- These files import no database and no React — data is passed in as plain
  arrays/objects by a hook.
- Exclude warmup sets from every calculation.
- Record formula and edge-case decisions in comments and `docs/decisions.md`.

## Future Sync (do not build yet)

- The `src/sync/` folder is reserved for a future Supabase sync and stays empty
  for now.
- The schema conventions above (UUIDs, `updatedAt`, soft deletes) exist so that
  sync can be added later without a schema rewrite. Don't add sync code before
  that phase.

## Robustness

- Handle empty and first-run states everywhere (a new user has no history).
- Handle Drizzle/SQLite errors gracefully; never let a failed query crash the
  app silently.
- Validate user-entered numbers (no negative reps/weight) before writing.
