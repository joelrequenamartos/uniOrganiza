"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { syncCalendarAction } from "@/app/actions/sync";

/** "Sincronizar ahora": pulls the university calendar immediately. */
export function SyncButton({ lastSynced }: { lastSynced: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  function sync() {
    setMessage(null);
    startTransition(async () => {
      const res = await syncCalendarAction();
      if (res.ok) {
        setMessage({ ok: true, text: "Calendario actualizado." });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="rounded-card border border-border bg-surface px-4 py-4">
      <button
        type="button"
        onClick={sync}
        disabled={pending}
        className="flex w-full items-center gap-3 text-left disabled:opacity-60"
      >
        <RefreshCw
          size={20}
          className={`shrink-0 text-text-muted ${pending ? "animate-spin" : ""}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">
            {pending ? "Sincronizando…" : "Sincronizar ahora"}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {lastSynced
              ? `Última vez: ${lastSynced}`
              : "Calendario de la universidad"}
          </p>
        </div>
      </button>
      {message && (
        <p
          role="status"
          className="mt-3 text-xs"
          style={{
            color: message.ok ? "var(--type-activity)" : "var(--prio-overdue)",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
