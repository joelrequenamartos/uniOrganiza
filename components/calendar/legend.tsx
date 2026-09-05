import type { Subject } from "@/types/domain";
import { SubjectDot } from "@/components/dashboard/subject-dot";

export function SubjectLegend({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Asignaturas
      </h2>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-2">
        {subjects.map((s) => (
          <li key={s.id} className="flex items-center gap-2.5 text-sm text-text">
            <SubjectDot color={s.color} size={9} />
            <span className="truncate">{s.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
