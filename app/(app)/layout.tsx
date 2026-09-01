import type { ReactNode } from "react";
import { BottomNav } from "@/components/nav/bottom-nav";

/**
 * Mobile app shell: a single scrolling column centred on wide viewports,
 * with a fixed bottom navigation. All screens live inside this group.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <main
        className="px-5 pb-24"
        style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
