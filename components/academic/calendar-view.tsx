import { MONTHS } from "@/lib/academic/calendars-2026-27";
import type { BuiltCalendar, LegendItem, ListRow } from "@/lib/academic/build";

const ORANGE = "#E8913A";
const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTH_NAMES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];
const DAY_ABBR = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const pad = (n: number) => String(n).padStart(2, "0");

/** yyyy-MM-dd → "Mar 15/10/2026" */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAY_ABBR[dow]} ${pad(d)}/${pad(m)}/${y}`;
}

export function CalendarView({ calendar }: { calendar: BuiltCalendar }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">{calendar.title}</h2>
        {calendar.subtitle && (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            {calendar.subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {MONTHS.map(({ year, month }) => (
          <MonthCard key={`${year}-${month}`} year={year} month={month} paint={calendar.paint} />
        ))}
      </div>

      <section className="mt-6 rounded-card border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-5">
          <Legend items={calendar.legendLeft} />
          <Legend items={calendar.legendRight} />
        </div>
        <p className="mt-4 text-[11px] italic text-text-faint">{calendar.note}</p>
      </section>

      <ChronologicalList rows={calendar.rows} />
    </div>
  );
}

function MonthCard({
  year,
  month,
  paint,
}: {
  year: number;
  month: number;
  paint: BuiltCalendar["paint"];
}) {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Monday-based offset of the 1st.
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="rounded-card border border-border bg-surface px-3 pb-3 pt-3.5">
      <h3 className="mb-2.5 px-1 text-[13px] font-bold tracking-wide">
        {MONTH_NAMES[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className="pb-1 text-center text-[10px] font-medium"
            style={{ color: i >= 5 ? ORANGE : "var(--text-faint)" }}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const p = paint.get(key);
          const weekend = i % 7 >= 5;
          return (
            <div
              key={key}
              className="relative flex aspect-square items-center justify-center rounded-lg text-[13px]"
              style={
                p
                  ? { background: p.bg, color: p.fg, fontWeight: 600 }
                  : { color: weekend ? ORANGE : "var(--text-muted)" }
              }
            >
              {day}
              {p?.tag && (
                <span className="absolute right-0.5 top-0.5 text-[8px] font-bold leading-none opacity-80">
                  {p.tag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2.5 text-sm text-text">
          <span
            className="h-3 w-3 shrink-0 rounded-[3px]"
            style={{ background: it.color }}
          />
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

function ChronologicalList({ rows }: { rows: ListRow[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Lista cronológica
      </h2>
      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li
            key={`${r.sort}-${r.type}-${i}`}
            className="flex items-stretch gap-3 rounded-card border border-border bg-surface py-3 pl-3 pr-4"
          >
            <span
              className="w-1 shrink-0 rounded-full"
              style={{ background: r.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tabular-nums text-text-muted">
                {formatDate(r.date)}
                {r.dateTo && ` – ${formatDate(r.dateTo)}`}
              </p>
              <p className="mt-0.5 text-sm font-medium text-text">{r.type}</p>
              {r.subject && (
                <p className="mt-0.5 text-xs text-text-muted">{r.subject}</p>
              )}
              {r.detail && (
                <p className="mt-0.5 text-xs text-text-faint">{r.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
