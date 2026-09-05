"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ManualEventType } from "@/lib/validation/event";
import { createEventAction } from "@/app/actions/events";

const TYPES: { value: ManualEventType; label: string }[] = [
  { value: "assignment", label: "Entrega" },
  { value: "activity", label: "Actividad" },
  { value: "exam", label: "Examen" },
];

const inputClass =
  "h-11 w-full min-w-0 box-border rounded-xl border border-border bg-surface-2 px-3 text-sm text-text outline-none transition-colors focus:border-border-strong placeholder:text-text-faint";
const labelClass = "mb-1.5 block text-xs font-medium text-text-muted";

function todayLocalDate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function AddEventForm({
  subjects,
  onDone,
}: {
  subjects: { id: string; name: string }[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [type, setType] = useState<ManualEventType>("assignment");
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(todayLocalDate);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dateLabel = useMemo(
    () => (type === "assignment" ? "Fecha límite" : "Fecha"),
    [type],
  );

  function submit() {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const res = await createEventAction({
        type,
        title,
        subjectId: subjectId || null,
        description: description.trim() || null,
        date,
        time: time || null,
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setTime("");
        router.refresh();
        onDone();
      } else {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
      }
    });
  }

  return (
    <form
      className="flex flex-col gap-4 py-1"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div
        role="radiogroup"
        aria-label="Tipo de evento"
        className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface-2 p-1"
      >
        {TYPES.map((t) => {
          const active = t.value === type;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setType(t.value)}
              className="h-9 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: active ? "var(--surface)" : "transparent",
                color: active ? "var(--text)" : "var(--text-muted)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        <label htmlFor="ev-title" className={labelClass}>
          Nombre
        </label>
        <input
          id="ev-title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Práctica 1"
          autoFocus
          maxLength={200}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs text-type-exam">{fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="ev-subject" className={labelClass}>
          Asignatura
        </label>
        <select
          id="ev-subject"
          className={inputClass}
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">Sin asignatura</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ev-date" className={labelClass}>
          {dateLabel}
        </label>
        <input
          id="ev-date"
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {fieldErrors.date && (
          <p className="mt-1 text-xs text-type-exam">{fieldErrors.date}</p>
        )}
      </div>

      <div>
        <label htmlFor="ev-time" className={labelClass}>
          Hora <span className="text-text-faint">(opcional)</span>
        </label>
        <input
          id="ev-time"
          type="time"
          className={inputClass}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="ev-desc" className={labelClass}>
          Descripción <span className="text-text-faint">(opcional)</span>
        </label>
        <textarea
          id="ev-desc"
          className="min-h-[72px] w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-border-strong placeholder:text-text-faint"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </div>

      {error && <p className="text-xs text-type-exam">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-12 rounded-xl bg-accent text-sm font-semibold text-accent-contrast transition-opacity disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
