import Link from "next/link";
import type { Subject } from "@/types/domain";
import { SubjectDot } from "./subject-dot";

/** Quick-access subjects shown above "Esta semana": university code → short label. */
const QUICK: { ref: string; label: string }[] = [
  { ref: "80346", label: "03GIIN Cálculo" },
  { ref: "80357", label: "14GIIN UI" },
  { ref: "80348", label: "05GIIN Fund. Computadores" },
];

export function SubjectChips({ subjects }: { subjects: Subject[] }) {
  const chips = QUICK.flatMap((q) => {
    const s = subjects.find((x) => x.externalRef === q.ref);
    return s ? [{ ...q, subject: s }] : [];
  });
  if (chips.length === 0) return null;

  return (
    <ul className="mb-4 flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <li key={c.ref}>
          <Link
            href={`/subjects/${c.subject.id}`}
            className="flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-[11px] font-medium text-text-muted transition-colors active:bg-surface-2"
          >
            <SubjectDot color={c.subject.color} size={6} />
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
