/**
 * Turns a flat list of events into the dashboard's two sections:
 *   0. "Atrasadas"    — past and not marked done (shown first, in red).
 *   1. "Esta semana"  — events of the current Mon–Sun week from today on, grouped by day.
 *   2. "Próximamente" — the alert block, grouped by type in priority order:
 *        Entregas -> Exámenes -> Clases -> Actividades
 *
 * Pure. No I/O.
 */
import type { AcademicEvent, EventType, PrioritizedEvent } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { daysUntil, localWeekRange, nowInTz, toTz } from "@/lib/dates";
import { selectUpcoming } from "./priority";

export interface DayGroup {
  /** ISO date key (yyyy-MM-dd, local). */
  dayKey: string;
  date: Date;
  events: AcademicEvent[];
}

export interface TypeGroup {
  type: EventType;
  items: PrioritizedEvent[];
}

const TYPE_ORDER: EventType[] = ["assignment", "exam", "class", "activity"];

export function groupThisWeek(
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): DayGroup[] {
  const { start, end } = localWeekRange(now);
  const buckets = new Map<string, DayGroup>();

  for (const e of events) {
    const instant = eventInstant(e);
    if (!instant) continue;
    if (e.status === "completed") continue;
    // Past and not done (exams excepted): lives under "Atrasadas", not here.
    if (e.type !== "exam" && daysUntil(instant, tz, now) < 0) continue;
    const local = toTz(instant, tz);
    if (local < start || local > end) continue;

    const dayKey = local.toISOString().slice(0, 10);
    let group = buckets.get(dayKey);
    if (!group) {
      group = { dayKey, date: local, events: [] };
      buckets.set(dayKey, group);
    }
    group.events.push(e);
  }

  return [...buckets.values()]
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
    .map((g) => ({
      ...g,
      events: g.events.sort((a, b) => {
        const ai = eventInstant(a) ?? "";
        const bi = eventInstant(b) ?? "";
        return ai.localeCompare(bi);
      }),
    }));
}

function prioritizedForDashboard(
  events: AcademicEvent[],
  tz: string,
  now: ReturnType<typeof nowInTz>,
): PrioritizedEvent[] {
  return selectUpcoming(events, tz, now);
}

function byType(items: PrioritizedEvent[]): TypeGroup[] {
  return TYPE_ORDER.map((type) => ({
    type,
    items: items.filter((p) => p.event.type === type),
  })).filter((g) => g.items.length > 0);
}

/** "Atrasadas": past, not marked done. Shown first, in red. */
export function groupOverdueByType(
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): TypeGroup[] {
  return byType(
    prioritizedForDashboard(events, tz, now).filter(
      (p) => p.priority === "overdue",
    ),
  );
}

/** "Próximamente": genuinely upcoming (within the alert horizon). */
export function groupUpcomingByType(
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): TypeGroup[] {
  return byType(
    prioritizedForDashboard(events, tz, now).filter(
      (p) => p.priority !== "overdue",
    ),
  );
}
