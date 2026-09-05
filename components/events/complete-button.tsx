"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { setEventStatusAction } from "@/app/actions/events";

/** Round check button that marks an assignment/activity as completed. */
export function CompleteButton({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [doneLocal, setDoneLocal] = useState(false);

  function complete() {
    setDoneLocal(true);
    startTransition(async () => {
      const res = await setEventStatusAction({
        id: eventId,
        status: "completed",
      });
      if (res.ok) router.refresh();
      else setDoneLocal(false);
    });
  }

  return (
    <button
      type="button"
      onClick={complete}
      disabled={pending || doneLocal}
      aria-label={`Marcar "${title}" como completada`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors active:bg-surface-2 disabled:opacity-60"
      style={{
        borderColor: doneLocal ? "var(--type-activity)" : "var(--border)",
        color: doneLocal ? "var(--type-activity)" : "var(--text-muted)",
      }}
    >
      <Check size={17} />
    </button>
  );
}
