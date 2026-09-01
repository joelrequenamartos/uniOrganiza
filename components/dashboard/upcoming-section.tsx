"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { PrioritizedEvent } from "@/types/domain";
import type { TypeGroup } from "@/lib/domain/grouping";
import { EVENT_TYPE_META, PRIORITY_COLOR } from "@/lib/domain/type-meta";
import { priorityLabel } from "@/lib/domain/priority";
import { formatDayMonth } from "@/lib/dates";
import { SubjectDot } from "./subject-dot";

export function UpcomingSection({
  groups,
  tz,
}: {
  groups: TypeGroup[];
  tz: string;
}) {
  const [done, setDone] = useState<Set<string>>(new Set());

  const visible = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !done.has(i.event.id)) }))
    .filter((g) => g.items.length > 0);

  function markDone(id: string) {
    // TODO Phase 7: call the completeEvent Server Action instead of local state.
    setDone((prev) => new Set(prev).add(id));
  }

  return (
    <section className="mb-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Próximamente
      </h2>

      {visible.length === 0 ? (
        <p className="rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted">
          Nada urgente en los próximos 14 días.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {visible.map((group) => (
            <div key={group.type}>
              <h3 className="mb-2 text-[13px] font-medium text-text-muted">
                {EVENT_TYPE_META[group.type].plural}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <UpcomingRow
                    key={item.event.id}
                    item={item}
                    tz={tz}
                    onDone={markDone}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingRow({
  item,
  tz,
  onDone,
}: {
  item: PrioritizedEvent;
  tz: string;
  onDone: (id: string) => void;
}) {
  const { event, priority } = item;
  const instant = event.dueAt ?? event.startAt!;
  const canComplete = event.type === "assignment" || event.type === "activity";

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface py-3 pl-3 pr-4">
      <span
        className="h-9 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: PRIORITY_COLOR[priority] }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: PRIORITY_COLOR[priority] }}
          >
            {priorityLabel(item)}
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
      </div>
      {canComplete && (
        <button
          type="button"
          onClick={() => onDone(event.id)}
          aria-label={`Marcar "${event.title}" como completada`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors active:bg-surface-2"
        >
          <Check size={17} />
        </button>
      )}
    </li>
  );
}
