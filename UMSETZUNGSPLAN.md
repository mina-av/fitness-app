# Umsetzungsplan: Fitness-Progress-App (MVP, offline-first)

> Dieses Dokument ist der Arbeitsplan für Claude Code. Jede Phase ist eigenständig
> abarbeitbar und endet mit prüfbaren Abnahmekriterien. Agenten-Zuordnung:
> **backend** (Datenschicht, Logik), **frontend** (Screens, UI), **qa** (Tests, Abnahme).
> Skills: **architecture**, **backend**, **frontend**, **qa**, **refine**, **deploy**.

---

## 1. Produktziel & Scope

**Ziel (MVP / V1):** Eine Expo-App (React Native), mit der ein einzelner Nutzer
Übungen verwaltet (vordefinierte Bibliothek + eigene), Trainingspläne anlegt
(z. B. Push-Pull-Legs), Workouts satzweise loggt (Gewicht, Wiederholungen, RIR,
optional RPE, Notizen; inkl. Supersets, Drop-Sets, Rest-Pause) und seinen
Fortschritt einsehen kann: Graphen, automatische PR-Erkennung, Trainings-Heatmap
sowie eine regelbasierte Wochenanalyse mit konkreten Tipps und Warnungen.
Komplett offline-fähig, alle Daten lokal in SQLite.

**Explizit NICHT im MVP (aber architektonisch vorbereitet):**
- Kein Supabase, kein Auth, kein Sync (→ V2)
- Keine LLM-generierten Tipps (→ V3; V1-Analyse ist rein regelbasiert)
- Kein Ernährungsmodul (→ V3; nur leerer Feature-Ordner als Platzhalter)
- Kein eigenes Medien-Hosting: Übungs-Videos/GIFs nur als URL-Verweis
- Kein Social/Sharing, keine Community-Pläne

**Nutzer-Kernloop:** App öffnen → Workout aus Plan oder frei starten → Übung
wählen → Satz eintragen (Gewicht, Reps, RIR in < 5 Sekunden) → Workout
abschließen → PRs werden automatisch gefeiert → sonntags Analyse lesen.

---

## 2. Technische Leitplanken (gelten für ALLE Phasen)

| Bereich | Entscheidung |
|---|---|
| Framework | Expo (aktuelle SDK-Version), TypeScript strict |
| Navigation | expo-router (file-based) |
| Datenbank | Expo SQLite + Drizzle ORM, Migrationen via drizzle-kit |
| IDs | UUIDs (expo-crypto `Crypto.randomUUID()`), NIE Auto-Increment |
| Zeitstempel | Unix-Millisekunden, jede Tabelle hat `createdAt`/`updatedAt` |
| Löschen | Immer Soft Delete (`deletedAt` setzen), nie hartes DELETE |
| State | React-Hooks + Drizzle-Queries; keine zusätzliche State-Lib im MVP |
| Analyse-Logik | Pure Functions ohne UI-/DB-Import (später serverseitig wiederverwendbar) |
| Einheiten | Gewicht intern immer kg (REAL); Anzeige-Formatierung in `src/lib/format.ts` |
| PRs | Werden BERECHNET, nie gespeichert (keine PR-Tabelle im MVP) |
| Sprache UI | Deutsch |

**Architektur-Invarianten (vom architecture-Skill bei jedem Review prüfen):**
1. Screens (`app/`) enthalten keine SQL-/Drizzle-Aufrufe → nur über Repository-Hooks aus `src/features/*`.
2. `src/features/analysis/` importiert nichts aus `db/` oder `components/` → nur Typen + pure Functions.
3. Kein Feature-Ordner importiert aus einem anderen Feature-Ordner (geteiltes → `src/lib` oder `src/components`).
4. `src/sync/` bleibt im MVP leer, wird aber angelegt (Grenze für V2).

---

## 3. Datenmodell & Projektstruktur

**`schema.ts` LIEGT BEREITS VOR** – unverändert übernehmen. Es enthält:

- `exercises` — Name, Muskelgruppe (brust/beine/ruecken/schultern/arme/core),
  sekundäre Muskeln (JSON), Equipment, Beschreibung, `mediaUrl` (Video/GIF-Link),
  `isCustom` (Seed-Übungen vs. eigene).
- `workout_templates` + `template_exercises` — Trainingspläne (z. B. PPL) mit
  Übungsreihenfolge, Ziel-Sätzen und Ziel-Rep-Bereich (min–max).
- `workouts` — Datum, optionale Template-Referenz, `finishedAt`.
- `sets` — Reps, Gewicht (kg), **RIR**, RPE (optional), Notiz,
  `setType` (`normal | dropset | restpause`), `supersetGroup`
  (gleiche Gruppe im selben Workout = Superset), `isWarmup`.

Wichtige Semantik:
- Ein aus einem Template gestartetes Workout ist eine **Kopie** — spätere
  Template-Änderungen verändern nie geloggte Historie.
- Drop-Sets: jeder Teilsatz ist eine eigene Zeile mit `setType='dropset'`,
  direkt aufeinanderfolgende `setNumber`.
- Warmup-Sätze fließen NIE in Volumen, PRs oder Empfehlungen ein.

```
fitness-app/
├── app/
│   ├── _layout.tsx           # Root: DB-Init, Provider, Tab-Navigation
│   ├── index.tsx             # Dashboard
│   ├── templates/
│   │   ├── index.tsx         # Trainingspläne (PPL, Full Body, ...)
│   │   └── [id].tsx          # Plan bearbeiten
│   ├── workout/
│   │   ├── new.tsx           # Start: aus Plan oder frei
│   │   └── [id].tsx          # Aktives Logging
│   ├── exercises/
│   │   ├── index.tsx         # Übungsbibliothek
│   │   └── [id].tsx          # Detail: Beschreibung, Medien, Historie, Charts, PRs
│   └── analysis/
│       └── index.tsx         # Wochenanalyse + Heatmap
├── src/
│   ├── db/                   # schema.ts (vorhanden), client.ts, migrations/
│   ├── features/
│   │   ├── exercises/        # hooks/, components/, seed/
│   │   ├── templates/        # hooks/, components/
│   │   ├── workouts/         # hooks/, components/
│   │   ├── analysis/         # volume.ts, oneRepMax.ts, personalRecords.ts,
│   │   │                     # trends.ts, rules.ts, hooks/
│   │   └── nutrition/        # leer, nur .gitkeep (V3)
│   ├── components/           # Button, Card, NumberStepper, EmptyState, Snackbar
│   ├── lib/                  # dates.ts, format.ts, ids.ts, constants.ts
│   └── sync/                 # leer, nur .gitkeep + README-Notiz "V2"
├── assets/
└── package.json
```

---

## 4. Phasenplan

### Phase 0 — Projekt-Setup
**Agent:** backend · **Skills:** architecture, backend

1. `npx create-expo-app` mit TypeScript, expo-router einrichten.
2. Dependencies: `expo-sqlite`, `drizzle-orm`, `drizzle-kit` (dev), `expo-crypto`.
3. Ordnerstruktur aus Abschnitt 3 anlegen (inkl. leerer `sync/`- und `nutrition/`-Ordner).
4. TypeScript strict, ESLint + Prettier, npm-Script `check` (typecheck + lint).
5. Vorhandenes `schema.ts` nach `src/db/schema.ts` übernehmen.

Abnahme (qa):
- [ ] `npm run check` läuft grün.
- [ ] App startet im Simulator mit Platzhalter-Screen.
- [ ] Ordnerstruktur entspricht Abschnitt 3.

---

### Phase 1 — Datenschicht & Seed
**Agent:** backend · **Skills:** backend, architecture

1. `src/db/client.ts`: SQLite öffnen, Drizzle initialisieren, Migrationen beim
   App-Start ausführen; erste Migration aus `schema.ts` generieren.
2. Repository-Hooks pro Feature (Rückgabe stets ohne Soft-Deleted-Zeilen):
   - Exercises: `useExercises({search?, muscleGroup?})`, `useExercise(id)`,
     `createExercise`, `updateExercise`, `archiveExercise`
   - Templates: `useTemplates()`, `useTemplate(id)`, `createTemplate`,
     `updateTemplate`, `archiveTemplate`, `reorderTemplateExercises`
   - Workouts: `useWorkouts()`, `useActiveWorkout()`,
     `startWorkout({templateId?})` (kopiert ggf. Template-Übungen als Vorgabe),
     `finishWorkout(id)`
   - Sets: `addSet(...)` (inkl. rir, setType, supersetGroup, note),
     `updateSet`, `removeSet`
   - Historie: `useExerciseHistory(exerciseId)` → chronologisch, nach Workout gruppiert
3. `src/lib/ids.ts` (UUID), `src/lib/dates.ts` (ISO-Woche Mo–So, Kalender-Utilities
   für die spätere Heatmap).
4. **Seed: vordefinierte Übungsbibliothek** (`features/exercises/seed/`):
   ~40 Standardübungen über alle 6 Kategorien (Brust, Beine, Rücken, Schultern,
   Arme, Core), mit Muskelgruppen, Equipment und Kurzbeschreibung; `isCustom=false`.
   Läuft nur bei leerer DB. Zusätzlich 2 Beispiel-Templates ("Push", "Full Body").

Abnahme (qa):
- [ ] Unit-Tests für alle Repository-Funktionen (Jest, Test-DB): CRUD,
      Soft Delete, `updatedAt`-Aktualisierung, Template-Kopie beim Workout-Start.
- [ ] Seed idempotent (zweiter App-Start dupliziert nichts).
- [ ] Kein Screen-Code greift direkt auf Drizzle zu (Invariante 1).

---

### Phase 2 — Übungsbibliothek & Trainingspläne
**Agent:** frontend · **Skills:** frontend, refine

1. **Übungsbibliothek** (`exercises/index.tsx`): Liste mit Suche + Kategorie-Filter
   (Chips: Brust/Beine/Rücken/Schultern/Arme/Core); eigene Übung anlegen/bearbeiten
   (Name, Kategorie, sekundäre Muskeln, Equipment, Beschreibung, Medien-URL);
   Archivieren mit Undo-Snackbar. Seed-Übungen sind editierbar, aber als
   "Standard" gekennzeichnet.
2. **Übungs-Detail** (`exercises/[id].tsx`): Beschreibung, eingebettetes
   GIF/Video (aus `mediaUrl`, mit Fallback), Muskelgruppen-Badges,
   Historien-Liste (Charts + PRs folgen in Phase 4).
3. **Trainingspläne** (`templates/`): Pläne anlegen (z. B. „Push“, „Pull“,
   „Legs“), Übungen mit Ziel-Sätzen und Rep-Bereich hinzufügen, per Drag
   sortieren.

Abnahme (qa):
- [ ] Flow: eigene Übung anlegen → in Plan aufnehmen → Plan sortieren.
- [ ] Suche + Filter kombinierbar; Empty States vorhanden.
- [ ] Ungültige Medien-URL crasht nicht (Fallback-Ansicht).

---

### Phase 3 — Workout-Logger (wichtigster Teil der App)
**Agent:** frontend · **Skills:** frontend, refine

1. **Workout-Start** (`workout/new.tsx`): aus Trainingsplan (Übungen + Zielvorgaben
   vorbefüllt) oder frei; zusätzlich "letztes Workout wiederholen".
2. **Aktives Logging** (`workout/[id].tsx`):
   - Pro Übung eine Karte mit Satzliste; neuer Satz mit Werten des letzten
     Satzes vorbefüllt. Anzeige "Letztes Mal: 3×8 @ 80 kg" und ggf. Zielvorgabe
     aus dem Plan ("Ziel: 3×8–12").
   - `NumberStepper`: große Touch-Ziele, ±1 Rep, ±2,5 kg; Satz-Eintrag in < 5 s.
   - **RIR-Eingabe** als Schnell-Chips (0/1/2/3/4+), RPE optional in Detailansicht,
     Notizfeld pro Satz.
   - **Satz-Typen**: Satz als Drop-Set oder Rest-Pause markieren; Drop-Set-Flow
     "Weiteren Drop hinzufügen" (neue Zeile, weniger Gewicht vorbefüllt).
   - **Supersets**: zwei oder mehr Übungen zu einer Superset-Gruppe verbinden;
     UI zeigt sie gebündelt und alterniert die Eingabereihenfolge.
   - Warmup-Toggle pro Satz. Workout abschließen → `finishedAt`.
   - **PR-Feedback beim Eintragen**: schlägt der Satz einen bisherigen Bestwert
     (schwerster Satz / bestes e1RM / meiste Reps bei diesem Gewicht), sofort
     dezent feiern (Badge/Konfetti) — Berechnung über `personalRecords.ts`
     aus Phase 4 (falls Phase 4 noch nicht fertig: Platzhalter-Hook, Feature-Flag).
   - App-Kill beendet das Workout NICHT (beim nächsten Start fortsetzbar).
3. **Dashboard** (`index.tsx`): "Workout starten/fortsetzen", letzte 3 Workouts,
   Mini-Wochenübersicht.

UX-Leitplanken: Einhandbedienung; keine Pflicht-Tastatureingaben im Kern-Flow;
RIR/Satz-Typ/Notiz sind optional und dürfen den 5-Sekunden-Flow nicht blockieren.

Abnahme (qa):
- [ ] Kompletter Flow aus Plan UND frei, inkl. Superset + Drop-Set.
- [ ] App-Kill während aktivem Workout → fortsetzbar, keine Datenverluste.
- [ ] Komponenten-Tests `NumberStepper` (keine negativen Werte, 2,5-kg-Schritte).

---

### Phase 4 — Analyse-Logik (pure Functions)
**Agent:** backend · **Skills:** backend, qa

Alle Dateien in `src/features/analysis/`, ohne DB-/UI-Imports. Warmup-Sätze
werden überall ausgeschlossen.

1. `oneRepMax.ts`: **Epley** `w*(1+reps/30)` UND **Brzycki** `w*36/(37-reps)`;
   Default Epley, Formel als Parameter; reps=1 → Gewicht selbst; Brzycki nur
   für reps < 37 definiert (Guard).
2. `volume.ts`: Wochenvolumen (Σ reps × kg) gesamt, pro Übung, pro Muskelgruppe
   (sekundäre Muskeln zählen mit Faktor 0,5); Wochengrenzen aus `lib/dates.ts`.
3. `personalRecords.ts`: pro Übung — schwerster Satz, bestes e1RM, meiste Reps
   je Gewichtsstufe; Funktion `isNewPR(candidateSet, history)` für das
   Live-Feedback aus Phase 3.
4. `consistency.ts`: Trainingsfrequenz pro Woche, Streaks, Datenreihe für
   Kalender-Heatmap (Datum → Trainingsvolumen).
5. `trends.ts`: aktuelle vs. Vorwoche (Volumen, Bestwerte, Einheiten);
   Stagnation: e1RM einer Übung ≥ 3 Wochen ohne Verbesserung; dabei RIR
   berücksichtigen (gleiches Gewicht bei gesunkenem RIR = Fortschritt, keine
   Stagnation).
6. `rules.ts` → `Recommendation[]` `{type, severity: 'tipp'|'warnung', exerciseId?, message}`:
   - Alle Arbeitssätze ≥ oberes Ziel-Rep-Ende (aus Template, sonst Default 12)
     bei RIR ≥ 2 → Steigerung +2,5 kg vorschlagen.
   - Stagnation ≥ 3 Wochen → Deload (−10 %) oder Programmwechsel-Hinweis
     (z. B. „probiere 5/3/1“) vorschlagen.
   - **Überlastungs-Warnung**: Wochenvolumen einer Muskelgruppe > +30 % ggü.
     Schnitt der letzten 3 Wochen, oder durchgehend RIR 0 über eine Woche.
   - **Untervolumen-Warnung**: bespielte Muskelgruppe < 10 Arbeitssätze/Woche
     (nur wenn die Gruppe grundsätzlich trainiert wird).
   - Konsistenz: < 2 Einheiten/Woche → Hinweis.
7. `useWeeklyAnalysis(weekOffset)`-Hook: lädt Sätze, ruft pure Functions,
   liefert `WeeklyReport` (Kennzahlen + Recommendations + Heatmap-Daten).

Abnahme (qa):
- [ ] Unit-Tests mit Fixtures für JEDE Regel (positiv + negativ) und beide
      1RM-Formeln; Randfälle: leere Woche, nur Warmups, erste Nutzungswoche,
      Übung ohne Historie, Brzycki-Guard.
- [ ] PR-Erkennung: Drop-Sets erzeugen keine falschen PRs (nur `setType='normal'`
      zählt für Gewichts-PRs — Entscheidung dokumentieren).
- [ ] Testabdeckung `features/analysis/` ≥ 90 % Zeilen.
- [ ] Keine Imports aus `db/` oder React in den pure-Function-Dateien.

---

### Phase 5 — Progress-UI: Charts, PRs, Heatmap, Wochenanalyse
**Agent:** frontend · **Skills:** frontend, refine

1. Chart-Lib wählen (Empfehlung: `react-native-gifted-charts` oder
   `victory-native`; Entscheidung in `docs/decisions.md`).
2. **Übungs-Detail erweitern**: Liniendiagramme Gewicht über Zeit + e1RM über
   Zeit (umschaltbar Epley/Brzycki), Volumen pro Workout; PR-Sektion
   (schwerster Satz, bestes e1RM, Rep-Rekorde) mit Datum.
3. **Wochenanalyse-Screen**: Wochen-Navigation (← →), Kennzahlen (Einheiten,
   Volumen gesamt + pro Muskelgruppe, neue PRs), Empfehlungen aus `rules.ts`
   mit klarer optischer Trennung Tipp vs. Warnung, Volumen-Balkenchart der
   letzten 8 Wochen.
4. **Kalender-Heatmap** (Monatsansicht) für Trainingshäufigkeit, Intensität
   nach Tagesvolumen; Tap auf Tag → Workout öffnen.
5. Empty/Onboarding-Zustände: erste Woche ohne Vergleichsdaten sauber erklären.

Abnahme (qa):
- [ ] Alle Ansichten korrekt mit: 0 Workouts, 1 Workout, 4+ Wochen Daten
      (Seed-Skript um "6 Monate Demo-Daten" erweitern).
- [ ] Empfehlungen/PRs stimmen stichprobenartig mit Phase-4-Fixtures überein.
- [ ] Charts + Heatmap flüssig bei 6 Monaten Daten.

---

### Phase 6 — Härtung & Release-Vorbereitung
**Agenten:** qa, backend · **Skills:** qa, refine, deploy

1. E2E-Durchlauf (Maestro oder manuelles Skript) des Kernloops inkl. Plan,
   Superset, PR, Analyse.
2. Performance: Logging-Screen flüssig bei 1.000+ Sätzen.
3. Fehlerpfade: fehlgeschlagene Migration → verständliche Meldung statt Crash.
4. Daten-Export als JSON (Teilen-Dialog) — Backup, solange es keinen Sync gibt.
5. App-Icon, Splash, `app.json`, EAS-Build-Profil für interne Verteilung
   (deploy-Skill).

Abnahme:
- [ ] E2E-Kernloop grün.
- [ ] Export enthält alle nicht-gelöschten Entitäten und ist re-importierbar.
- [ ] EAS-Build auf echtem Gerät installierbar.

---

## 5. Ausblick (NICHT jetzt bauen, nur nicht verbauen)

- **V2 – Sync:** Supabase (Postgres-Schema ≙ `schema.ts`), Sync über
  `updatedAt`-Delta + Soft Deletes; Code ausschließlich in `src/sync/`.
- **V3 – LLM-Tipps:** `WeeklyReport` (Phase 4) als strukturierter Kontext an die
  Anthropic API; regelbasierte Empfehlungen bleiben Fallback.
- **V3 – Ernährung:** eigenes Feature-Modul (`meals`, `food_items`),
  Lebensmitteldaten via Open Food Facts, Makro-Ziele aus Trainingsdaten.

## 6. Arbeitsweise für Claude Code

- Phasen strikt in Reihenfolge; eine Phase gilt erst als fertig, wenn der
  qa-Agent alle Abnahme-Checkboxen bestätigt hat.
- Nach jeder Phase: Architektur-Review gegen die 4 Invarianten
  (architecture-Skill), erst dann Commit ("Phase N: …").
- Bei Zielkonflikten gewinnt: Datenintegrität > Logging-Geschwindigkeit (UX) >
  Featureumfang > Optik.
- Offene Entscheidungen (Chart-Lib, PR-Semantik bei Drop-Sets, …) kurz in
  `docs/decisions.md` festhalten statt lange zu diskutieren.
