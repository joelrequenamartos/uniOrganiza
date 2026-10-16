import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CalendarView } from "@/components/academic/calendar-view";
import {
  buildCalendar,
  CALENDAR_TABS,
  isCalendarId,
} from "@/lib/academic/build";

export const metadata = { title: "Mis calendarios" };

export default async function CalendarsPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const active = isCalendarId(c) ? c : "primero";
  const calendar = buildCalendar(active);

  return (
    <>
      <div className="mb-5">
        <Link
          href="/profile"
          className="mb-3 inline-flex items-center gap-1 text-xs text-text-muted transition-colors active:text-text"
        >
          <ChevronLeft size={15} />
          Mi perfil
        </Link>
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
          Mis calendarios
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Calendario académico 2026/27 · Grado en Ingeniería Informática
        </p>
      </div>

      <nav
        aria-label="Calendario"
        className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface p-1"
      >
        {CALENDAR_TABS.map((t) => {
          const on = t.id === active;
          return (
            <Link
              key={t.id}
              href={`/profile/calendars?c=${t.id}`}
              replace
              scroll={false}
              aria-current={on ? "page" : undefined}
              className="flex h-9 items-center justify-center rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: on ? "var(--surface-2)" : "transparent",
                color: on ? "var(--text)" : "var(--text-muted)",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <CalendarView calendar={calendar} />
    </>
  );
}
