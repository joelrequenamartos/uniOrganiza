/**
 * Centralised date/time helpers. Rules:
 *  - The database stores UTC instants (timestamptz) as ISO strings.
 *  - All display + "which day is this" logic happens in the user's IANA tz.
 *  - No component should ever call `new Date()` directly; go through here.
 */
import { TZDate } from "@date-fns/tz";
import {
  differenceInCalendarDays,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

export const DEFAULT_TIMEZONE = "Europe/Madrid";

/** "Now" as a timezone-aware date. */
export function nowInTz(tz: string): TZDate {
  return TZDate.tz(tz);
}

/** Parse a UTC ISO string into a timezone-aware date in `tz`. */
export function toTz(iso: string, tz: string): TZDate {
  return new TZDate(iso, tz);
}

/** Whole calendar days from today (in tz) to the given instant. Past = negative. */
export function daysUntil(iso: string, tz: string, now = nowInTz(tz)): number {
  return differenceInCalendarDays(toTz(iso, tz), now);
}

export function isSameLocalDay(a: string, b: Date | string, tz: string): boolean {
  const bd = typeof b === "string" ? toTz(b, tz) : b;
  return isSameDay(toTz(a, tz), bd);
}

export function localDayRange(date: TZDate): { start: TZDate; end: TZDate } {
  const start = startOfDay(date) as TZDate;
  const end = new TZDate(start.getTime() + 24 * 60 * 60 * 1000 - 1, date.timeZone);
  return { start, end };
}

/** Monday-based week containing `date`. */
export function localWeekRange(date: TZDate): { start: TZDate; end: TZDate } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }) as TZDate,
    end: endOfWeek(date, { weekStartsOn: 1 }) as TZDate,
  };
}

// ---- Formatting (Spanish locale) -------------------------------------------

export function formatTime(iso: string, tz: string): string {
  return format(toTz(iso, tz), "HH:mm", { locale: es });
}

/** e.g. "Lun 7" */
export function formatDayShort(iso: string, tz: string): string {
  const s = format(toTz(iso, tz), "EEE d", { locale: es });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** e.g. "23 septiembre" */
export function formatDayMonth(iso: string, tz: string): string {
  return format(toTz(iso, tz), "d MMMM", { locale: es });
}

/** e.g. "Septiembre" */
export function formatMonth(date: Date | string, tz: string): string {
  const d = typeof date === "string" ? toTz(date, tz) : date;
  const s = format(d, "MMMM", { locale: es });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatRange(startIso: string, endIso: string, tz: string): string {
  return `${formatTime(startIso, tz)} — ${formatTime(endIso, tz)}`;
}
