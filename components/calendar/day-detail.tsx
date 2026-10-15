import { Check } from "lucide-react";
import type { AcademicEvent } from "@/types/domain";
import { eventInstant } from "@/types/domain";
import { EVENT_TYPE_META, rowStyleFor } from "@/lib/domain/type-meta";
import { formatRange, formatTime } from "@/lib/dates";
import { termLabel } from "@/lib/domain/subject-term";
import { SubjectDot } from "@/components/dashboard/subject-dot";

export function DayDetail({
  label,
  events,
  tz,
}: {
  label: string;
  events: AcademicEvent[];
  tz: string;
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </h2>
      {events.length === 0 ? (
        <p className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
          Sin eventos este día.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e) => {
            const instant = eventInstant(e)!;
            const meta = EVENT_TYPE_META[e.type];
            const time =
              e.startAt && e.endAt
                ? formatRange(e.startAt, e.endAt, tz)
                : e.allDay
                  ? "Todo el día"
                  : formatTime(instant, tz);
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
                style={{
                  ...rowStyleFor(e.type),
                  opacity: e.status === "completed" ? 0.5 : 1,
                }}
              >
                <span
                  className="h-8 w-0.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      e.type === "exam"
                        ? "var(--type-exam)"
                        : e.subject?.color ?? "var(--border-strong)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`flex items-center gap-1.5 truncate text-sm font-medium ${
                      e.status === "completed"
                        ? "text-text-muted line-through"
                        : "text-text"
                    }`}
                  >
                    {e.status === "completed" && (
                      <Check
                        size={13}
                        strokeWidth={3}
                        className="shrink-0 text-type-activity"
                      />
                    )}
                    {e.type === "class"
                      ? e.subject
                        ? termLabel(e.subject)
                        : "Clase"
                      : e.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-text-muted">
                    <span style={{ color: meta.cssVar }}>{meta.label}</span>
                    {e.subject && e.type !== "class" && (
                      <>
                        <span aria-hidden>·</span>
                        <SubjectDot color={e.subject.color} size={6} />
                        <span className="truncate">{termLabel(e.subject)}</span>
                      </>
                    )}
                  </p>
                  {e.description && (
                    <p className="mt-0.5 truncate text-xs text-text-faint">
                      {e.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs tabular-nums text-text-muted">
                  {time}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
