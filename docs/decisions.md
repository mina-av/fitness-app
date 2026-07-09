# Technische Entscheidungen

Kurz gehaltene Sammlung von Entscheidungen, die nicht offensichtlich aus dem
Code hervorgehen. Neue Einträge oben anfügen.

## Phase 4 — Analyse-Logik

**`src/features/analysis/` wird wie `src/lib` behandelt (Ausnahme von der
Feature-Isolation-Invariante).**
Andere Features (aktuell: `workouts` für das PR-Feedback beim Satz-Eintragen)
importieren aus den reinen Funktionsdateien in `src/features/analysis/`
(z.B. `personalRecords.ts`). Das ist eine bewusste Ausnahme von "kein Feature
importiert aus einem anderen Feature": `analysis/` hat keinen State, keinen
DB-/React-Import in den Top-Level-Dateien und ist explizit für serverseitige
Wiederverwendung gedacht — funktional identisch zu `src/lib`, nur als
eigener, umfangreicherer Ordner geführt (so auch in UMSETZUNGSPLAN.md
vorgesehen: "PR-Berechnung über personalRecords.ts aus Phase 4"). Die
Ausnahme gilt NUR für die reinen Funktionsdateien, nicht für
`analysis/hooks/` (DB-/React-Code bleibt dort gekapselt).

**Eigene, DB-unabhängige Typen in `analysis/types.ts` statt Re-Use von
`src/db/schema.ts`-Typen.**
`AnalysisSet`/`AnalysisExercise`/`AnalysisWorkout` sind bewusst separat
definiert (strukturell kompatibel zu den Drizzle-Typen, aber ohne Import aus
`src/db`), damit `analysis/` wirklich keine Abhängigkeit auf die
Datenbankschicht hat.

**Brzycki-Guard (reps ≥ 37) fällt auf Epley zurück, statt zu werfen oder
NaN zu liefern.**
Damit ist `oneRepMax()` für jede Eingabe total (nie NaN/Infinity) und die UI
muss keinen Sonderfall behandeln.

**Nur `setType === 'normal'` zählt für Gewichts-PRs.**
Drop-Sets und Rest-Pause-Sätze sind Ermüdungssätze mit bewusst reduziertem
Gewicht/Reps direkt nach einem Arbeitssatz — sie würden sonst falsche "meiste
Reps bei diesem Gewicht"-PRs erzeugen. Betrifft `calculatePersonalRecords`
und `isNewPR` in `personalRecords.ts`.

**Der allererste gültige (nicht-Warmup, `setType='normal'`) Satz einer Übung
gilt automatisch als PR.**
Es gibt nichts, das er nicht schlagen würde — der erste geloggte Satz wird
als Baseline gefeiert statt stillschweigend ignoriert zu werden.

**Stagnations-Erkennung vergleicht das beste e1RM der aktuellen (mit Daten
belegten) Woche gegen das beste der letzten 3 Wochen MIT Trainingsdaten**
(trainingsfreie Wochen werden übersprungen, nicht als "keine Verbesserung"
gewertet). Gleiches e1RM bei gesunkenem RIR gilt als Fortschritt (mehr
Kraftreserve verbraucht bei gleicher Last), nicht als Stagnation.

**Untervolumen-Warnung zählt nur primäre Muskelgruppen-Zuordnungen**, sowohl
für "wird die Gruppe grundsätzlich trainiert" (irgendwann als primäre
Muskelgruppe einer geloggten Übung) als auch für den Satz-Zähler der
aktuellen Woche. Sekundäre Muskeln zählen hier bewusst nicht mit (im
Gegensatz zu `volumeByMuscleGroup`, wo sie mit Faktor 0,5 einfließen) — sonst
würde z.B. Trizeps-Mitarbeit bei Bankdrücken fälschlich als "Arme
trainiert" durchgehen.

**`useWeeklyAnalysis` löst Ziel-Reps über ALLE Templates auf** (nicht nur das
zuletzt genutzte), erster gefundener Wert pro Übung gewinnt. Ausreichend für
die grobe Steigerungs-Regel; eine genauere Zuordnung (z.B. "welches Template
wurde für DIESES Workout benutzt") wäre mehr Aufwand für wenig zusätzlichen
Nutzen.

## Phase 2 — Design-System

**Dunkles Theme als Standard, Akzentfarbe Blau `#3B82F6`.**
Nutzer-Vorgabe: gut lesbar im Gym/Low-Light, kein automatisches
System-Theme im MVP. Details in `docs/design-system.md`.

## Phase 3 — Workout-Logger

**Freie Workouts ohne Plan persistieren die Übungsauswahl nicht separat.**
Es gibt keine `workout_exercises`-Tabelle (bewusst, siehe Phase-1-Schema).
Die Übungsliste für ein laufendes Workout wird aus Template (falls
vorhanden) + Route-Parametern (bei "letztes Workout wiederholen") + bereits
geloggten Sätzen zusammengesetzt. Konsequenz: ein App-Kill vor dem ersten
Satz einer neu gewählten (aber noch nicht geloggten) Übung verliert nur die
Auswahl, nie bereits geloggte Daten — passt zur Prioritätsregel aus
UMSETZUNGSPLAN.md (Datenintegrität > Logging-Geschwindigkeit/UX).

**Sortierung der Plan-Übungen über Auf/Ab-Buttons statt Drag-and-drop.**
Keine dedizierte Gesture-Bibliothek für Reordering installiert. Funktional
gleichwertig, bei Bedarf später nachrüstbar.
