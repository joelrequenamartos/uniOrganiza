/**
 * Turns a flat list of events into the dashboard's two sections:
 *   1. "Esta semana"  — every event in the current Mon–Sun week, grouped by day.
 *   2. "Próximamente" — the alert block, grouped by type in priority order:
 *        Entregas -> Exámenes -> Clases -> Actividades
 *
 * Pure. No I/O.
 */
import type { AcademicEvent, EventType, PrioritizedEvent } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { localWeekRange, nowInTz, toTz } from "@/lib/dates";
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
  const { start: weekStart } = localWeekRange(now);
  // Past items from the current week are already listed under "Esta semana".
  return selectUpcoming(events, tz, now).filter((p) => {
    if (p.priority !== "overdue") return true;
    if (p.event.type !== "class" && p.event.type !== "activity") return true;
    const instant = eventInstant(p.event);
    return !instant || toTz(instant, tz) < weekStart;
  });
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
