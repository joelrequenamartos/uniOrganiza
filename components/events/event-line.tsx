import type { ReactNode } from "react";
import type { AcademicEvent } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { EVENT_TYPE_META } from "@/lib/domain/type-meta";
import { formatDayMonth, formatRange, formatTime } from "@/lib/dates";

/** One event as a row: date · title · time, with a subject-coloured edge. */
export function EventLine({
  event,
  tz,
  showType = false,
  action,
}: {
  event: AcademicEvent;
  tz: string;
  showType?: boolean;
  action?: ReactNode;
}) {
  const instant = eventInstant(event);
  const meta = EVENT_TYPE_META[event.type];
  const time =
    event.startAt && event.endAt
      ? formatRange(event.startAt, event.endAt, tz)
      : event.allDay
        ? "Todo el día"
        : instant
          ? formatTime(instant, tz)
          : "";

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3">
      <span
        className="h-8 w-0.5 shrink-0 rounded-full"
        style={{ backgroundColor: event.subject?.color ?? "var(--border-strong)" }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">
          {event.type === "class" ? event.subject?.name ?? "Clase" : event.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
          {showType && <span style={{ color: meta.cssVar }}>{meta.label}</span>}
          {showType && instant && <span aria-hidden>·</span>}
          {instant && <span>{formatDayMonth(instant, tz)}</span>}
        </p>
      </div>
      {time && (
        <span className="shrink-0 text-xs tabular-nums text-text-muted">
          {time}
        </span>
      )}
      {action}
    </li>
  );
}
