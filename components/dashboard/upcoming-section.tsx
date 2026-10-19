import type { PrioritizedEvent } from "@/types/domain";
import type { TypeGroup } from "@/lib/domain/grouping";
import {
  EVENT_TYPE_META,
  PRIORITY_COLOR,
  rowStyleFor,
} from "@/lib/domain/type-meta";
import { priorityLabel } from "@/lib/domain/priority";
import { formatDayMonth } from "@/lib/dates";
import { SubjectDot } from "./subject-dot";
import { CompleteButton } from "@/components/events/complete-button";

export function UpcomingSection({
  groups,
  tz,
  variant = "upcoming",
}: {
  groups: TypeGroup[];
  tz: string;
  variant?: "upcoming" | "overdue";
}) {
  const overdue = variant === "overdue";
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <section className="mb-8">
      <h2
        className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]"
        style={{ color: overdue ? "var(--prio-overdue)" : "var(--text-muted)" }}
      >
        {overdue ? "Atrasadas" : "Próximamente"}
        {overdue && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
            style={{
              background: "color-mix(in srgb, var(--prio-overdue) 18%, transparent)",
            }}
          >
            {count}
          </span>
        )}
      </h2>

      {groups.length === 0 ? (
        <p className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
          Nada urgente en los próximos 14 días.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.type}>
              <h3 className="mb-2 text-[13px] font-medium text-text-muted">
                {EVENT_TYPE_META[group.type].plural}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <UpcomingRow key={item.event.id} item={item} tz={tz} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingRow({ item, tz }: { item: PrioritizedEvent; tz: string }) {
  const { event, priority } = item;
  const instant = event.dueAt ?? event.startAt!;
  const canComplete = event.type !== "exam";
  const isExam = event.type === "exam";
  const barColor = isExam ? "var(--type-exam)" : PRIORITY_COLOR[priority];

  return (
    <li
      className="flex items-center gap-3 rounded-card border border-border bg-surface py-3 pl-3 pr-4"
      style={
        priority === "overdue"
          ? {
              borderColor:
                "color-mix(in srgb, var(--prio-overdue) 40%, var(--border))",
              background:
                "color-mix(in srgb, var(--prio-overdue) 7%, var(--surface))",
            }
          : rowStyleFor(event.type)
      }
    >
      <span
        className="h-9 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: barColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: barColor }}
          >
            {isExam ? `Examen · ${priorityLabel(item)}` : priorityLabel(item)}
          </span>
          <span className="text-[11px] text-text-faint">
            {formatDayMonth(instant, tz)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-text">
          {event.title}
        </p>
        {event.subject && (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-text-muted">
            <SubjectDot color={event.subject.color} size={6} />
            {event.subject.name}
          </p>
        )}
        {event.description && (
          <p className="mt-0.5 truncate text-xs text-text-faint">
            {event.description}
          </p>
        )}
      </div>
      {canComplete && (
        <CompleteButton eventId={event.id} title={event.title} />
      )}
    </li>
  );
}
