import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { AcademicEvent } from "@/types/domain";
import { EmptyState } from "@/components/ui/screen-header";
import { EventLine } from "@/components/events/event-line";
import { CompleteButton } from "@/components/events/complete-button";
import { getEvents, getSubject } from "@/lib/data";
import { buildSubjectAgenda } from "@/lib/domain/subject-agenda";
import { EVENT_TYPE_META } from "@/lib/domain/type-meta";
import { DEFAULT_TIMEZONE, nowInTz, toTz } from "@/lib/dates";
import { eventInstant } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tz = DEFAULT_TIMEZONE;

  const subject = await getSubject(id);
  if (!subject) notFound();

  const events = await getEvents({ subjectId: id });
  const sections = buildSubjectAgenda(events, tz);

  return (
    <>
      <div className="mb-5">
        <Link
          href="/subjects"
          className="mb-3 inline-flex items-center gap-1 text-xs text-text-muted transition-colors active:text-text"
        >
          <ChevronLeft size={15} />
          Asignaturas
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
            {subject.name}
          </h1>
        </div>
      </div>

      {sections.length === 0 ? (
        <EmptyState
          title="Nada en esta asignatura todavía"
          hint="Aquí verás sus clases, entregas, exámenes y actividades, pasadas y futuras."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((section) =>
            section.type === "class" ? (
              <ClassesChecklist
                key="class"
                classes={events.filter((e) => e.type === "class")}
                tz={tz}
              />
            ) : (
              <section key={section.type}>
                <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                  {EVENT_TYPE_META[section.type].plural}
                </h2>

                {section.upcoming.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {section.upcoming.map((e) => (
                      <EventLine
                        key={e.id}
                        event={e}
                        tz={tz}
                        action={
                          e.type !== "exam" ? (
                            <CompleteButton
                              eventId={e.id}
                              title={e.title}
                              done={e.status === "completed"}
                            />
                          ) : undefined
                        }
                      />
                    ))}
                  </ul>
                )}

                {section.past.length > 0 && (
                  <div
                    className={section.upcoming.length > 0 ? "mt-4" : undefined}
                  >
                    <h3 className="mb-2 text-[11px] font-medium text-text-faint">
                      Anteriores
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {section.past.map((e) => (
                        <EventLine
                          key={e.id}
                          event={e}
                          tz={tz}
                          muted={e.status === "completed"}
                          action={
                            e.type !== "exam" ? (
                              <CompleteButton
                                eventId={e.id}
                                title={e.title}
                                done={e.status === "completed"}
                              />
                            ) : undefined
                          }
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ),
          )}
        </div>
      )}
    </>
  );
}

/** Every class in date order, with a check per class so you can see which ones you've watched. */
function ClassesChecklist({
  classes,
  tz,
}: {
  classes: AcademicEvent[];
  tz: string;
}) {
  const sorted = [...classes].sort((a, b) =>
    (eventInstant(a) ?? "").localeCompare(eventInstant(b) ?? ""),
  );
  const done = sorted.filter((e) => e.status === "completed").length;
  const today = nowInTz(tz);
  today.setHours(0, 0, 0, 0);

  return (
    <section>
      <h2 className="mb-2.5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Clases
        <span className="font-medium normal-case tracking-normal tabular-nums text-text-faint">
          {done} de {sorted.length} vistas
        </span>
      </h2>
      <ul className="flex flex-col gap-2">
        {sorted.map((e) => {
          const isDone = e.status === "completed";
          const instant = eventInstant(e);
          const missed = !isDone && !!instant && toTz(instant, tz) < today;
          return (
            <EventLine
              key={e.id}
              event={e}
              tz={tz}
              muted={isDone}
              attention={missed}
              action={
                <CompleteButton eventId={e.id} title={e.title} done={isDone} />
              }
            />
          );
        })}
      </ul>
    </section>
  );
}
