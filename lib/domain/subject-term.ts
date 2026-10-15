/**
 * Which cuatrimestre (term) each subject is taught in, keyed by the university
 * subject code (`external_ref`). Source: the campus "Mis asignaturas" list.
 * Update when a new academic year / subject appears.
 */
export type Term = 1 | 2;

const TERM_BY_CODE: Record<string, Term> = {
  "80346": 1, // Cálculo (inicio 2026-10-15)
  "80348": 1, // Fundamentos de Computadores (2026-10-19)
  "80357": 1, // Interfaces usuario / computador (2026-10-14)
  "80352": 2, // Organización y Gestión de Empresas (2027-02-10)
  "80353": 2, // Tecnología y Organización de Computadores (2027-02-11)
  "80361": 2, // Fundamentos de Ingeniería de Software (2027-02-09)
};

export function termOf(externalRef: string | null): Term | null {
  return (externalRef && TERM_BY_CODE[externalRef]) || null;
}

/** "1C: Cálculo" — falls back to the bare name when the term is unknown. */
export function termLabel(subject: { name: string; term: Term | null }): string {
  return subject.term ? `${subject.term}C: ${subject.name}` : subject.name;
}
