/**
 * Splits a subject's events into the sections shown on its detail page:
 *   Clases · Entregas · Exámenes · Actividades
 *
 * Each section keeps BOTH directions — nothing is ever dropped:
 *   - upcoming: today or later, plus any pending assignment/activity that's
 *     overdue (still needs action, so it stays with the actionable items)
 *   - past: everything before today that isn't already counted as upcoming
 *     (completed items, and past classes/exams), newest first
 * Pure.
 */
import { startOfDay } from "date-fns";
import type { AcademicEvent, EventType } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { nowInTz, toTz } from "@/lib/dates";

export interface AgendaSection {
  type: EventType;
  upcoming: AcademicEvent[];
  past: AcademicEvent[];
}

const ORDER: EventType[] = ["class", "activity", "assignment", "exam"];

export function buildSubjectAgenda(
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): AgendaSection[] {
  const dayStart = startOfDay(now);

  const withInstant = events.filter((e) => eventInstant(e) !== null);

  const isUpcoming = (e: AcademicEvent) => {
    const instant = eventInstant(e)!;
    if (toTz(instant, tz) >= dayStart) return true;
    // Overdue and still pending: keep it actionable, not buried in history.
    return (
      e.status !== "completed" &&
      (e.type === "assignment" || e.type === "activity")
    );
  };

  const byInstant = (e: AcademicEvent) => eventInstant(e) ?? "";

  return ORDER.map((type) => {
    const items = withInstant.filter((e) => e.type === type);
    return {
      type,
      upcoming: items
        .filter(isUpcoming)
        .sort((a, b) => byInstant(a).localeCompare(byInstant(b))),
      past: items
        .filter((e) => !isUpcoming(e))
        .sort((a, b) => byInstant(b).localeCompare(byInstant(a))),
    };
  }).filter((s) => s.upcoming.length > 0 || s.past.length > 0);
}
