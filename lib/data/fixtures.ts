/**
 * Temporary in-memory data — used until Supabase is wired up (final phase).
 *
 * Subjects are the real ones (GIIN, 1º/2º). Events come from the university
 * ICS feed (see ./sync.ts). The public API in lib/data/* mirrors what the
 * Supabase-backed version will expose, so swapping the implementation later
 * touches only those files.
 */
import type { Subject } from "@/types/domain";

export const SUBJECTS: Subject[] = [
  { id: "s-calculo", name: "Cálculo", color: "#7aa2f7", externalRef: "80346", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-fund-comp", name: "Fundamentos de Computadores", color: "#bb9af7", externalRef: "80348", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-oge", name: "Organización y Gestión de Empresas", color: "#e0af68", externalRef: "80352", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-toc", name: "Tecnología y Organización de Computadores", color: "#7dcfff", externalRef: "80353", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-iuc", name: "Interfaces usuario / computador", color: "#9ece6a", externalRef: "80357", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-fis", name: "Fundamentos de Ingeniería de Software", color: "#f7768e", externalRef: "80361", createdAt: "2026-09-01T00:00:00.000Z" },
];
