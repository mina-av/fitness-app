# Sync (V2)

Reserviert für die spätere Supabase-Cloud-Synchronisation. Bleibt im MVP (V1)
leer. Das Schema in `src/db/schema.ts` ist bereits sync-freundlich (UUIDs,
`createdAt`/`updatedAt`, Soft Deletes), damit Sync-Code hier später ohne
Schema-Rewrite ergänzt werden kann.

Keine Auth-, Server- oder Sync-Logik vor Phase V2 hinzufügen.
