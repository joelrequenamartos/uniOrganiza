import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { startOfDay } from "date-fns";
import { EmptyState, ScreenHeader } from "@/components/ui/screen-header";
import { getEvents, getSubjects } from "@/lib/data";
import { EVENT_TYPE_META } from "@/lib/domain/type-meta";
import { eventInstant } from "@/types/domain";
import { DEFAULT_TIMEZONE, formatDayMonth, nowInTz, toTz } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const tz = DEFAULT_TIMEZONE;
  const now = nowInTz(tz);
  const dayStart = startOfDay(now);

  const [subjects, events] = await Promise.all([
    getSubjects(),
    getEvents({ includeCompleted: false }),
  ]);

  return (
    <>
      <ScreenHeader title="Asignaturas" />

      {subjects.length === 0 ? (
        <EmptyState
          title="Todavía no hay asignaturas"
          hint="Se importarán del calendario de tu universidad o podrás crearlas."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {subjects.map((s) => {
            const next = events
              .filter((e) => e.subjectId === s.id)
              .filter((e) => {
                const i = eventInstant(e);
                return i ? toTz(i, tz) >= dayStart : false;
              })
              .sort((a, b) =>
                (eventInstant(a) ?? "").localeCompare(eventInstant(b) ?? ""),
              )[0];

            const subtitle = next
              ? `${EVENT_TYPE_META[next.type].label} · ${formatDayMonth(
                  eventInstant(next)!,
                  tz,
                )}`
              : "Sin próximos eventos";

            return (
              <li key={s.id}>
                <Link
                  href={`/subjects/${s.id}`}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3.5 transition-colors active:bg-surface-2"
                >
                  <span
                    className="h-9 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {s.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {subtitle}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-text-faint"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
