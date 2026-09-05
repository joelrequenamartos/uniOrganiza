"use client";

import { useMemo, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AcademicEvent } from "@/types/domain";
import { buildMonthGrid, type DayCell } from "@/lib/domain/calendar";
import { formatFullDay, formatMonthYear, nowInTz } from "@/lib/dates";
import { DayDetail } from "./day-detail";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MAX_DOTS = 4;

export function MonthView({
  events,
  tz,
}: {
  events: AcademicEvent[];
  tz: string;
}) {
  const now = useMemo(() => nowInTz(tz), [tz]);
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selectedKey, setSelectedKey] = useState<string>(() =>
    formatKey(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, events, tz, now),
    [cursor, events, tz, now],
  );

  const selectedCell = useMemo(() => {
    for (const week of grid.weeks) {
      for (const cell of week) if (cell.key === selectedKey) return cell;
    }
    return null;
  }, [grid, selectedKey]);

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const selectedDate = keyToDate(selectedKey, tz);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">
          {formatMonthYear(new Date(cursor.year, cursor.month, 1), tz)}
        </h1>
        <div className="flex gap-1">
          <NavBtn label="Mes anterior" onClick={() => shiftMonth(-1)}>
            <ChevronLeft size={18} />
          </NavBtn>
          <NavBtn label="Mes siguiente" onClick={() => shiftMonth(1)}>
            <ChevronRight size={18} />
          </NavBtn>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[11px] font-medium text-text-faint"
          >
            {d}
          </div>
        ))}
        {grid.weeks.flat().map((cell) => (
          <DayButton
            key={cell.key}
            cell={cell}
            selected={cell.key === selectedKey}
            onSelect={() => setSelectedKey(cell.key)}
          />
        ))}
      </div>

      <DayDetail
        label={formatFullDay(selectedDate)}
        events={selectedCell?.events ?? []}
        tz={tz}
      />
    </div>
  );
}

function NavBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors active:bg-surface-2"
    >
      {children}
    </button>
  );
}

function DayButton({
  cell,
  selected,
  onSelect,
}: {
  cell: DayCell;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-sm transition-colors"
      style={{
        borderColor: selected ? "var(--accent)" : "transparent",
        background: cell.isToday ? "var(--surface-2)" : "transparent",
        color: cell.inMonth ? "var(--text)" : "var(--text-faint)",
        fontWeight: cell.isToday ? 600 : 400,
        opacity: cell.inMonth ? 1 : 0.55,
      }}
    >
      <span>{cell.dayOfMonth}</span>
      <span className="flex h-1.5 items-center gap-0.5">
        {cell.subjectColors.slice(0, MAX_DOTS).map((c, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: c }}
          />
        ))}
      </span>
    </button>
  );
}

function formatKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function keyToDate(key: string, tz: string): TZDate {
  const [y, m, d] = key.split("-").map(Number);
  return new TZDate(y, m - 1, d, tz);
}
