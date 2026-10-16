import Link from "next/link";
import { User } from "lucide-react";

/** Person icon (top-left of the main screens) → "Mi perfil". */
export function ProfileLink() {
  return (
    <Link
      href="/profile"
      aria-label="Mi perfil"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors active:bg-surface-2"
    >
      <User size={18} />
    </Link>
  );
}
