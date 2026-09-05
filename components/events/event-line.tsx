import type { ReactNode } from "react";
import type { AcademicEvent } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { EVENT_TYPE_META, rowStyleFor } from "@/lib/domain/type-meta";
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
  const isExam = event.type === "exam";
  const time =
    event.startAt && event.endAt
      ? formatRange(event.startAt, event.endAt, tz)
      : event.allDay
        ? "Todo el día"
        : instant
          ? formatTime(instant, tz)
          : "";

  return (
    <li
      className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
      style={rowStyleFor(event.type)}
    >
      <span
        className="h-8 w-0.5 shrink-0 rounded-full"
        style={{
          backgroundColor: isExam
            ? "var(--type-exam)"
            : event.subject?.color ?? "var(--border-strong)",
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-medium text-text">
          {isExam && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                color: "var(--type-exam)",
                background: "color-mix(in srgb, var(--type-exam) 16%, transparent)",
              }}
            >
              Examen
            </span>
          )}
          {event.type === "class" ? event.subject?.name ?? "Clase" : event.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
          {showType && <span style={{ color: meta.cssVar }}>{meta.label}</span>}
          {showType && instant && <span aria-hidden>·</span>}
          {instant && <span>{formatDayMonth(instant, tz)}</span>}
        </p>
        {event.description && (
          <p className="mt-0.5 truncate text-xs text-text-faint">
            {event.description}
          </p>
        )}
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
