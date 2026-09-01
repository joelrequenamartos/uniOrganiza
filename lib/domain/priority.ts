/**
 * "Próximamente" logic — pure functions, no I/O, unit-testable.
 *
 * Windows (calendar days from today, user's local tz):
 *   > 14   -> none      (not shown in the alerts block)
 *   <= 14  -> low
 *   <= 7   -> medium
 *   <= 2   -> high
 *   == 0   -> max       (due / exam today)
 *   past   -> overdue for pending assignments/activities; hidden for exams/classes
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

  if (d < 0) {
    // Past. Exams and classes simply drop off. Pending deliverables become overdue.
    if (event.type === "assignment" || event.type === "activity") {
      return { event, priority: "overdue", daysUntil: d };
    }
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
    return n === 1 ? "Atrasada 1 día" : `Atrasada ${n} días`;
  }
  if (p.daysUntil === 0) return "Hoy";
  if (p.daysUntil === 1) return "Mañana";
  return `En ${p.daysUntil} días`;
}
