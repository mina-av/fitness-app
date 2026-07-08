const DAY_MS = 24 * 60 * 60 * 1000;

/** Montag=0 ... Sonntag=6 (im Gegensatz zu Date#getDay(), wo Sonntag=0 ist). */
function isoDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Beginn der ISO-Woche (Montag 00:00) der Woche, die `date` enthält. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - isoDayIndex(d));
  return d;
}

/** Ende der ISO-Woche (Sonntag 23:59:59.999) der Woche, die `date` enthält. */
export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return endOfDay(d);
}

/**
 * Wochengrenzen relativ zu heute. `weekOffset` 0 = aktuelle Woche, -1 = Vorwoche, ...
 */
export function getWeekRange(
  weekOffset = 0,
  reference: Date = new Date(),
): { start: Date; end: Date } {
  const ref = new Date(reference);
  ref.setDate(ref.getDate() + weekOffset * 7);
  return { start: startOfWeek(ref), end: endOfWeek(ref) };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Stabiler Tages-Schlüssel (lokale Zeitzone) für Gruppierung, z.B. Heatmap. */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Kalender-Raster für die Monatsansicht (Heatmap): volle Wochen (Mo-So), die den
 * angegebenen Monat abdecken, inkl. Tage aus dem Vor-/Folgemonat zum Auffüllen.
 */
export interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
}

export function getMonthCalendarDays(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const gridStart = startOfWeek(firstOfMonth);
  const gridEnd = endOfWeek(lastOfMonth);

  const days: CalendarDay[] = [];
  for (let t = gridStart.getTime(); t <= gridEnd.getTime(); t += DAY_MS) {
    const date = new Date(t);
    days.push({
      date,
      dateKey: formatDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    });
  }
  return days;
}
