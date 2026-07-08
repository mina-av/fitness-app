---
paths:
  - "src/db/**"
  - "src/features/**"
  - ".env*"
  - "app.json"
  - "eas.json"
---

# Security & Data-Safety Rules (offline-first Expo app)

This app stores all data locally on the device. There is no server, no user
login, and no API to attack in the MVP. "Security" here mostly means: don't lose
the user's data, don't leak anything if secrets are ever added, and validate
input. The classic web concerns (RLS, auth endpoints, security headers) do not
apply yet.

## Secrets Management

- The MVP has no server credentials. Do NOT invent API keys or auth just to fill
  this section.
- If a key is ever added later (e.g. an LLM API key for V3 tips, or Supabase
  keys for V2 sync): NEVER commit it. Keep it out of the repo, document required
  variables with dummy values, and make sure `.env*` files stay gitignored.
- Remember that anything bundled into the app ships to the user's device —
  never assume a key embedded in the app is secret. Sensitive calls belong on a
  server (a later phase), not in the client.

## Input Validation

- Validate all user-entered values before writing to SQLite: no negative reps or
  weight, RIR/RPE within sane ranges, required fields present.
- Guard calculations against bad input (e.g. Brzycki 1RM is undefined for
  reps ≥ 37 — handle it instead of producing nonsense).

## Data Safety (the real priority here)

- Treat the local SQLite database as the single source of truth — protect it:
  run migrations carefully, and never hard-delete (soft delete via `deletedAt`).
- Provide a data export (JSON share) so the user has a backup while there is no
  cloud sync. Losing months of training logs is the worst outcome for this app.
- A failed migration must show a clear message, not silently wipe or corrupt
  data.

## Future Phases (when they arrive)

- **V2 sync (Supabase):** at that point, real auth, Row Level Security, and
  transport security become relevant — add those rules together with the sync
  code, scoped to `src/sync/`.
- **V3 LLM tips:** the Anthropic API call must go through a minimal backend so
  the API key is never shipped in the app bundle.

## Code Review Triggers

- Any change that could delete or overwrite user data in bulk (migrations,
  reset/clear features) requires explicit user approval.
- Introducing any secret, network call, or external service requires explicit
  user approval and proper secret handling as above.
