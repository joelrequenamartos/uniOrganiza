import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      <div>
        <p className="text-sm font-medium text-text">Página no encontrada</p>
        <p className="mx-auto mt-1 max-w-[32ch] text-xs text-text-muted">
          El enlace no lleva a ningún sitio.
        </p>
      </div>
      <Link
        href="/"
        className="h-10 rounded-xl bg-surface-2 px-5 text-sm font-medium leading-10 text-text transition-colors active:bg-border-strong"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
