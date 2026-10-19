"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { setEventStatusAction } from "@/app/actions/events";

/**
 * Round check button: toggles an event between done and not done.
 * `done` is the saved state; the tap flips it optimistically while the
 * Server Action runs, and reverts by itself if the action fails.
 */
export function CompleteButton({
  eventId,
  title,
  done = false,
}: {
  eventId: string;
  title: string;
  done?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isDone, setIsDone] = useOptimistic(done);

  function toggle() {
    const next = !isDone;
    startTransition(async () => {
      setIsDone(next);
      const res = await setEventStatusAction({
        id: eventId,
        status: next ? "completed" : "pending",
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isDone}
      aria-label={
        isDone
          ? `Quitar la marca de hecho a "${title}"`
          : `Marcar "${title}" como hecho`
      }
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors active:bg-surface-2 disabled:opacity-60"
      style={{
        borderColor: isDone ? "var(--type-activity)" : "var(--border)",
        background: isDone
          ? "color-mix(in srgb, var(--type-activity) 18%, transparent)"
          : "transparent",
        color: isDone ? "var(--type-activity)" : "var(--text-muted)",
      }}
    >
      <Check size={17} />
    </button>
  );
}
