/**
 * Month-grid model for the calendar screen. Pure.
 *
 * A grid is 6 rows × 7 columns (Mon–Sun), always full weeks so the layout
 * never jumps. Each cell carries the events that fall on that local day and
 * the distinct subject colours to render as dots.
 */
import { TZDate } from "@date-fns/tz";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { AcademicEvent } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { nowInTz, toTz } from "@/lib/dates";

export interface DayCell {
  /** yyyy-MM-dd, local. Stable key. */
  key: string;
  dayOfMonth: number;
  inMonth: boolean;
  isToday: boolean;
  events: AcademicEvent[];
  /** Distinct subject colours present that day, in first-seen order. */
  subjectColors: string[];
}

export interface MonthGrid {
  year: number;
  /** 0-indexed month. */
  month: number;
  weeks: DayCell[][];
}

function dayKeyOf(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function buildMonthGrid(
  year: number,
  month: number,
  events: AcademicEvent[],
  tz: string,
  now = nowInTz(tz),
): MonthGrid {
  const first = startOfMonth(new TZDate(year, month, 1, tz));
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(
    new TZDate(year, month + 1, 0, tz),
    { weekStartsOn: 1 },
  );
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byDay = new Map<string, AcademicEvent[]>();
  for (const e of events) {
    if (e.status === "completed") continue;
    const instant = eventInstant(e);
    if (!instant) continue;
    const key = dayKeyOf(toTz(instant, tz));
    const list = byDay.get(key);
    if (list) list.push(e);
    else byDay.set(key, [e]);
  }

  const todayKey = dayKeyOf(now);

  const cells: DayCell[] = days.map((d) => {
    const key = dayKeyOf(d);
    const dayEvents = (byDay.get(key) ?? []).sort((a, b) => {
      const ai = eventInstant(a) ?? "";
      const bi = eventInstant(b) ?? "";
      return ai.localeCompare(bi);
    });
    const subjectColors: string[] = [];
    for (const e of dayEvents) {
      const c = e.subject?.color;
      if (c && !subjectColors.includes(c)) subjectColors.push(c);
    }
    return {
      key,
      dayOfMonth: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: key === todayKey,
      events: dayEvents,
      subjectColors,
    };
  });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return { year, month, weeks };
}
