"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await createClient().auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      aria-label="Cerrar sesión"
      className="flex h-9 w-9 items-center justify-center rounded-full text-text-faint transition-colors active:bg-surface-2 disabled:opacity-50"
    >
      <LogOut size={18} />
    </button>
  );
}
