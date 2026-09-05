import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/screen-header";
import { EventLine } from "@/components/events/event-line";
import { getEvents, getSubject } from "@/lib/data";
import { buildSubjectAgenda } from "@/lib/domain/subject-agenda";
import { EVENT_TYPE_META } from "@/lib/domain/type-meta";
import { DEFAULT_TIMEZONE } from "@/lib/dates";

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

  const events = await getEvents({ subjectId: id, includeCompleted: false });
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
          title="Nada pendiente en esta asignatura"
          hint="Aquí verás sus próximas clases, entregas, exámenes y actividades."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.type}>
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                {EVENT_TYPE_META[section.type].plural}
              </h2>
              <ul className="flex flex-col gap-2">
                {section.events.map((e) => (
                  <EventLine key={e.id} event={e} tz={tz} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
