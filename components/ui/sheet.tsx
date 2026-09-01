"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Bottom sheet — a Radix Dialog that slides up from the bottom edge.
 * Mobile-first: full width, rounded top, respects the safe-area inset.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-[fade-in_150ms_ease-out]" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[20px] border border-border bg-surface text-text shadow-2xl outline-none data-[state=open]:animate-[sheet-up_220ms_cubic-bezier(0.32,0.72,0,1)]"
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-border-strong" />
          <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-3">
            <div>
              <Dialog.Title className="text-[15px] font-semibold tracking-tight">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 text-xs text-text-muted">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">
                  {title}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Cerrar"
              className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="max-h-[75dvh] overflow-y-auto px-5 pb-6 pt-2">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
