/**
 * "Próximamente" logic — pure functions, no I/O, unit-testable.
 *
 * Windows (calendar days from today, user's local tz):
 *   > 14   -> none      (not shown in the alerts block)
 *   <= 14  -> low
 *   <= 7   -> medium
 *   <= 2   -> high
 *   == 0   -> max       (due / exam today)
 *   ended  -> overdue the moment a timed event ends (all-day: next day); stays on
 *             screen until marked done. Applies to everything except
 *             exams, which have no "done" action and simply drop off
 *   completed -> never shown as pending
 */
import type {
  AcademicEvent,
  PrioritizedEvent,
  PriorityLevel,
} from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { daysUntil, nowInTz } from "@/lib/dates";

export const ALERT_HORIZON_DAYS = 14;

export function computePriority(
  event: AcademicEvent,
  tz: string,
  now = nowInTz(tz),
): PrioritizedEvent | null {
  if (event.status === "completed") return null;

  const instant = eventInstant(event);
  if (!instant) return null;

  const d = daysUntil(instant, tz, now);

  // Past. Nothing the user can tick off disappears on its own: it stays,
  // flagged overdue, until marked done. Exams have no "done", so they drop off.
  if (event.type !== "exam") {
    // Timed events are overdue the moment they end; all-day ones the next day.
    const endMs = new Date(event.endAt ?? instant).getTime();
    const ended = event.allDay ? d < 0 : endMs < now.getTime();
    if (ended) {
      const minutesAgo = Math.max(0, Math.floor((now.getTime() - endMs) / 60_000));
      return { event, priority: "overdue", daysUntil: Math.min(d, 0), minutesAgo };
    }
  } else if (d < 0) {
    return null;
  }

  let priority: PriorityLevel;
  if (d === 0) priority = "max";
  else if (d <= 2) priority = "high";
  else if (d <= 7) priority = "medium";
  else if (d <= ALERT_HORIZON_DAYS) priority = "low";
  else priority = "none";

  return { event, priority, daysUntil: d };
}

const RANK: Record<PriorityLevel, number> = {
  overdue: 0,
  max: 1,
  high: 2,
  medium: 3,
  low: 4,
  none: 5,
};

/** Events that belong in the alerts / "próximamente" block, most urgent first. */
export function selectUpcoming(
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): PrioritizedEvent[] {
  return events
    .map((e) => computePriority(e, tz, now))
    .filter((p): p is PrioritizedEvent => p !== null && p.priority !== "none")
    .sort(
      (a, b) =>
        RANK[a.priority] - RANK[b.priority] || a.daysUntil - b.daysUntil,
    );
}

export function priorityLabel(p: PrioritizedEvent): string {
  if (p.priority === "overdue") {
    const n = Math.abs(p.daysUntil);
    const isClass = p.event.type === "class";
    if (n === 0) {
      // Ended earlier today.
      const m = p.minutesAgo ?? 0;
      const ago = m < 60 ? `${Math.max(m, 1)} min` : `${Math.floor(m / 60)} h`;
      return isClass ? `Hace ${ago}` : `Atrasada hace ${ago}`;
    }
    if (isClass) return n === 1 ? "Hace 1 día" : `Hace ${n} días`;
    return n === 1 ? "Atrasada 1 día" : `Atrasada ${n} días`;
  }
  if (p.daysUntil === 0) return "Hoy";
  if (p.daysUntil === 1) return "Mañana";
  return `En ${p.daysUntil} días`;
}
