"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, Layers, Plus } from "lucide-react";
import { useState, type ComponentType } from "react";
import { Sheet } from "@/components/ui/sheet";
import { AddEventForm } from "@/components/events/add-event-form";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

const ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/subjects", label: "Asignaturas", icon: Layers },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav({
  subjects,
}: {
  subjects: { id: string; name: string }[];
}) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border bg-bg/85 backdrop-blur-xl"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <ul className="flex items-stretch">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors"
                  style={{ color: active ? "var(--text)" : "var(--text-faint)" }}
                >
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide text-text-faint"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-contrast">
                <Plus size={20} strokeWidth={2.6} />
              </span>
              Añadir
            </button>
          </li>
        </ul>
      </nav>

      <Sheet
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Nuevo evento"
        description="Entrega, actividad o examen"
      >
        <AddEventForm
          subjects={subjects}
          onDone={() => setAddOpen(false)}
        />
      </Sheet>
    </>
  );
}
