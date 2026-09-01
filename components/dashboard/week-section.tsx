import type { DayGroup } from "@/lib/domain/grouping";
import { EVENT_TYPE_META } from "@/lib/domain/type-meta";
import { eventInstant } from "@/types/domain";
import { formatDayShort, formatRange, formatTime } from "@/lib/dates";
import { SubjectDot } from "./subject-dot";

export function WeekSection({
  groups,
  tz,
}: {
  groups: DayGroup[];
  tz: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Esta semana
      </h2>

      {groups.length === 0 ? (
        <p className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
          No tienes nada esta semana.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((g) =>
            g.events.map((e) => {
              const instant = eventInstant(e)!;
              const meta = EVENT_TYPE_META[e.type];
              const timeLabel =
                e.startAt && e.endAt
                  ? formatRange(e.startAt, e.endAt, tz)
                  : e.allDay
                    ? "Todo el día"
                    : formatTime(instant, tz);
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
                >
                  <div className="w-11 shrink-0 text-xs font-medium text-text-muted">
                    {formatDayShort(instant, tz)}
                  </div>
                  <div
                    className="h-8 w-0.5 shrink-0 rounded-full"
                    style={{ backgroundColor: e.subject?.color ?? "var(--border-strong)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {e.type === "class"
                        ? e.subject?.name ?? "Clase"
                        : e.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-text-muted">
                      {e.type !== "class" && (
                        <>
                          <span>{meta.label}</span>
                          <span aria-hidden>·</span>
                        </>
                      )}
                      {e.subject && e.type !== "class" && (
                        <SubjectDot color={e.subject.color} size={6} />
                      )}
                      {e.type === "class" ? null : (
                        <span className="truncate">{e.subject?.name}</span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs tabular-nums text-text-muted">
                    {timeLabel}
                  </div>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </section>
  );
}
