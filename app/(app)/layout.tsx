import type { ReactNode } from "react";
import { BottomNav } from "@/components/nav/bottom-nav";
import { getSubjects } from "@/lib/data";

/**
 * Mobile app shell: a single scrolling column centred on wide viewports,
 * with a fixed bottom navigation. All screens live inside this group.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const subjects = await getSubjects();

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <main
        className="px-5"
        style={{
          paddingTop: "calc(var(--safe-top) + 12px)",
          paddingBottom: "calc(var(--safe-bottom) + 104px)",
        }}
      >
        {children}
      </main>
      <BottomNav
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
