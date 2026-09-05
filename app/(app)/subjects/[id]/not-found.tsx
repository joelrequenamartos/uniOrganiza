import Link from "next/link";

export default function SubjectNotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-sm font-medium text-text">Asignatura no encontrada</p>
        <p className="mx-auto mt-1 max-w-[32ch] text-xs text-text-muted">
          Puede que se haya eliminado.
        </p>
      </div>
      <Link
        href="/subjects"
        className="h-10 rounded-xl bg-surface-2 px-5 text-sm font-medium leading-10 text-text transition-colors active:bg-border-strong"
      >
        Ver asignaturas
      </Link>
    </div>
  );
}
