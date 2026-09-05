"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "h-11 w-full min-w-0 box-border rounded-xl border border-border bg-surface-2 px-3 text-[16px] text-text outline-none transition-colors focus:border-border-strong placeholder:text-text-faint";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function submit() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        if (!data.session) {
          setNotice(
            "Cuenta creada. Revisa tu correo para confirmarla y luego entra.",
          );
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError("Email o contraseña incorrectos.");
          return;
        }
      }

      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-muted">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>

      {error && <p className="text-xs text-type-exam">{error}</p>}
      {notice && <p className="text-xs text-type-activity">{notice}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-12 rounded-xl bg-accent text-sm font-semibold text-accent-contrast transition-opacity disabled:opacity-50"
      >
        {pending
          ? "…"
          : mode === "signin"
            ? "Entrar"
            : "Crear cuenta"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError(null);
          setNotice(null);
        }}
        className="mt-1 text-xs text-text-muted underline-offset-2 hover:underline"
      >
        {mode === "signin"
          ? "¿No tienes cuenta? Crear una"
          : "Ya tengo cuenta"}
      </button>
    </form>
  );
}
