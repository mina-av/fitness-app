# CLAUDE.md — Fitness-Progress-App

Diese Datei gibt Claude Code den Überblick über das Projekt. Bei jedem Start
zuerst lesen.

## Was ist das?

Eine **offline-first Fitness-Tracking-App**: Der Nutzer legt Übungen an, erstellt
Trainingspläne, loggt Workouts satzweise (Gewicht, Wiederholungen, RIR, optional
RPE, Notizen; inkl. Supersets, Drop-Sets, Rest-Pause) und sieht seinen
Fortschritt: Graphen, automatische PR-Erkennung, Trainings-Heatmap und eine
regelbasierte Wochenanalyse mit Tipps und Warnungen.

**Alle Daten liegen lokal auf dem Gerät** (SQLite). Die App muss im Gym ohne
Internet voll funktionieren. Es gibt im MVP **keinen Server, kein Login, keine
Cloud**.

## Tech-Stack

- **Framework:** Expo + React Native, TypeScript (strict)
- **Navigation:** expo-router (file-based, im `app/`-Ordner)
- **Datenbank:** Expo SQLite + Drizzle ORM, Migrationen via drizzle-kit
- **UI:** React-Native-Primitive + eigene Komponenten, gestylt mit `StyleSheet`
  (KEIN Next.js, KEIN Tailwind, KEIN shadcn/ui — das war die Web-Vorlage)
- **Build/Release:** EAS (Expo Application Services), NICHT Vercel

## Der Plan

Die vollständige, phasenweise Umsetzung steht in **`UMSETZUNGSPLAN.md`** im
Projektwurzelverzeichnis. Immer dort nachsehen, welche Phase dran ist und was sie
umfasst. Das Datenbankschema liegt in `src/db/schema.ts`.

## Projektstruktur (Kurzfassung)

```
app/                     Screens (expo-router)
src/db/                  schema.ts, client.ts, migrations/
src/features/<feature>/  hooks/ (Datenzugriff), components/ (Feature-UI)
src/features/analysis/   pure Funktionen: volume, oneRepMax, personalRecords, rules
src/components/          geteilte UI (Button, Card, NumberStepper, EmptyState)
src/lib/                 dates, format, ids, constants
src/sync/                LEER — reserviert für spätere Cloud-Synchronisation
```

## Architektur-Invarianten (immer einhalten)

1. Screens (`app/`) greifen NIE direkt auf die Datenbank zu — nur über
   Repository-Hooks aus `src/features/*/hooks/`.
2. `src/features/analysis/` enthält NUR pure Funktionen — kein DB-Import, kein
   React. So bleiben sie testbar und später serverseitig wiederverwendbar.
3. Kein Feature importiert aus einem anderen Feature (geteiltes → `src/lib` oder
   `src/components`).
4. `src/sync/` bleibt vorerst leer (Grenze für die spätere Cloud-Phase).

## Daten-Konventionen (sync-freundlich)

- IDs sind UUIDs (`expo-crypto`), nie Auto-Increment.
- Jede Tabelle hat `createdAt` + `updatedAt` (unix-ms); `updatedAt` bei jedem
  Update aktualisieren.
- Löschen ist immer ein Soft Delete (`deletedAt` setzen); jede Lese-Abfrage
  filtert soft-gelöschte Zeilen aus.
- Gewicht intern in kg; Anzeige-Formatierung nur über `src/lib/format.ts`.
- Warmup-Sätze werden aus Volumen, PRs und Empfehlungen ausgeschlossen.

## Sprache

- UI-Texte auf **Deutsch**.
- Code, Kommentare und Commit-Messages auf Englisch.

## Workflow (aus dem .claude-Setup)

Die Skills unter `.claude/skills/` steuern den Ablauf: `write-spec` →
`architecture` → `frontend` / `backend` → `qa` → `deploy`. `refine` zum
Überarbeiten. Feature-Status wird in `features/INDEX.md` getrackt. Commits:
`feat(PROJ-X): ...`, `fix(PROJ-X): ...`.

## Zukunft (NICHT jetzt bauen, nur nicht verbauen)

Das langfristige Ziel ist, die App **Personal Trainern für ihre (erwachsenen)
Klienten** anzubieten. Das bedeutet später:

- **Accounts & Cloud-Sync (spätere Phase):** echte Anmeldung und Synchronisation
  über Supabase. Das Schema ist dafür vorbereitet (UUIDs, `updatedAt`, Soft
  Deletes). Der Code dafür gehört ausschließlich in `src/sync/`. Erst angehen,
  wenn die lokale App fertig und erprobt ist.
- **Trainer-Klient-Modell:** zwei Rollen (Trainer erstellt Pläne / sieht
  Fortschritt, Klient trainiert) mit sauberer Datentrennung zwischen Nutzern.
  Das ist mehr als simples Login und wird bewusst später gestaltet.
- **LLM-Tipps (V3):** die regelbasierte Analyse liefert den strukturierten
  Kontext; ein LLM-Aufruf müsste über ein kleines Backend laufen (API-Key nie
  in die App bündeln).
- **Ernährungsmodul (V3):** eigenes Feature-Modul, Lebensmitteldaten via Open
  Food Facts.

Solange diese Phasen nicht dran sind: keine Auth-, Server- oder Sync-Logik
einbauen. Der Fokus liegt auf der lokalen, offline-fähigen App.
