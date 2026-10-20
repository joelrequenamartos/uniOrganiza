import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronRight, ChevronLeft, User } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SyncButton } from "@/components/profile/sync-button";
import { createClient } from "@/lib/supabase/server";
import { getLastSyncedAt } from "@/lib/data";
import { DEFAULT_TIMEZONE, formatDayMonth, formatTime } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const synced = await getLastSyncedAt();
  const lastSynced = synced
    ? `${formatDayMonth(synced, DEFAULT_TIMEZONE)}, ${formatTime(synced, DEFAULT_TIMEZONE)}`
    : null;

  return (
    <>
      <div className="mb-5">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-xs text-text-muted transition-colors active:text-text"
        >
          <ChevronLeft size={15} />
          Inicio
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted">
            <User size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
              Mi perfil
            </h1>
            <p className="truncate text-xs text-text-muted">{data.user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <Link
        href="/profile/calendars"
        className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-4 transition-colors active:bg-surface-2"
      >
        <CalendarRange size={20} className="shrink-0 text-text-muted" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">Mis calendarios</p>
          <p className="mt-0.5 text-xs text-text-muted">
            1.º curso, 2.º curso y exámenes
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-text-faint" />
      </Link>
      <div className="mt-3">
        <SyncButton lastSynced={lastSynced} />
      </div>
    </>
  );
}
