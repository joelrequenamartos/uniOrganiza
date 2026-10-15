import type { Subject } from "@/types/domain";
import { termLabel } from "@/lib/domain/subject-term";
import { SubjectDot } from "@/components/dashboard/subject-dot";

/** Subjects grouped by cuatrimestre: 1C first, then 2C, then unknown. */
export function SubjectLegend({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) return null;
  const rank = (s: Subject) => s.term ?? 3;
  const sorted = [...subjects].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "es"),
  );
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Asignaturas
      </h2>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-2">
        {sorted.map((s) => (
          <li key={s.id} className="flex items-center gap-2.5 text-sm text-text">
            <SubjectDot color={s.color} size={9} />
            <span className="truncate">{termLabel(s)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
