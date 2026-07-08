# Design System

Kurzreferenz für die App. Quelle der Wahrheit ist `src/lib/constants.ts`
(`COLORS`, `SPACING`, `RADIUS`, `TYPOGRAPHY`) — dieses Dokument beschreibt nur
die Entscheidung dahinter.

## Theme

- **Dunkel als Standard** (Gym/Low-Light-Nutzung), kein automatisches
  System-Theme im MVP.
- **Akzentfarbe:** Blau `#3B82F6` — Buttons, aktive Filter, PR-Feier.
- Stil: modern/minimal, ruhige Flächen, wenig Dekoration.

## Farben (dunkel)

| Token | Wert | Verwendung |
|---|---|---|
| `background` | `#0B0F14` | App-Hintergrund |
| `surface` | `#151B23` | Cards, Listenzeilen |
| `surfaceElevated` | `#1E2733` | Modals, erhöhte Flächen |
| `border` | `#2A3441` | Trennlinien, Card-Rahmen |
| `textPrimary` | `#F5F7FA` | Haupttext |
| `textSecondary` | `#9AA7B5` | Sekundärtext, Meta-Infos |
| `accent` | `#3B82F6` | Primäraktionen, aktive Zustände |
| `accentMuted` | `#1D3A63` | Akzent-Hintergrund (Chips, Badges) |
| `success` | `#22C55E` | PRs, positive Trends |
| `warning` | `#F59E0B` | Warnungen (Überlastung etc.) |
| `danger` | `#EF4444` | Löschen/Archivieren, Fehler |

## Spacing-Skala

4 / 8 / 12 / 16 / 24 / 32 px (`SPACING.xs … xxl`).

## Radius

Card `12px`, Chip/Badge `999px` (voll gerundet), Modal `16px`.

## Typografie

System-Font. Größen: `title` 22/600, `subtitle` 17/600, `body` 15/400,
`small` 13/400, `label` 13/600 (uppercase, letterSpacing für Badges/Chips).

## Komponenten-Prinzipien

- Touch-Ziele mindestens 44×44pt.
- Kein `TouchableOpacity` — `Pressable`.
- Listen mit `FlatList`, nicht `map()` in `ScrollView`.
- Leere Zustände immer über `EmptyState`, nie ein leerer Screen.
- Zerstörende Aktionen (Archivieren) über Snackbar mit Undo statt
  Bestätigungsdialog — passt besser in den schnellen Gym-Flow.
