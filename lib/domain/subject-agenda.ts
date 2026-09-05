/**
 * Splits a subject's events into the sections shown on its detail page:
 *   Próximas clases · Próximas entregas · Actividades · Exámenes
 *
 * "Upcoming" = anchored today or later (local tz). Pending assignments and
 * activities that are already overdue are kept so they don't silently vanish.
 * Past classes and past exams drop off. Pure.
 */
import { startOfDay } from "date-fns";
import type { AcademicEvent, EventType } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { nowInTz, toTz } from "@/lib/dates";

export interface AgendaSection {
  type: EventType;
  events: AcademicEvent[];
}

const ORDER: EventType[] = ["class", "assignment", "exam", "activity"];

export function buildSubjectAgenda(
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): AgendaSection[] {
  const dayStart = startOfDay(now);

  const upcoming = events.filter((e) => {
    if (e.status === "completed") return false;
    const instant = eventInstant(e);
    if (!instant) return false;
    if (toTz(instant, tz) >= dayStart) return true;
    return e.type === "assignment" || e.type === "activity"; // keep overdue
  });

  upcoming.sort((a, b) => {
    const ai = eventInstant(a) ?? "";
    const bi = eventInstant(b) ?? "";
    return ai.localeCompare(bi);
  });

  return ORDER.map((type) => ({
    type,
    events: upcoming.filter((e) => e.type === type),
  })).filter((s) => s.events.length > 0);
}
