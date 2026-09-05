import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Entrar · uniOrganiza" };

export default function LoginPage() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6"
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">uniOrganiza</h1>
        <p className="mt-1 text-sm text-text-muted">
          Tu universidad en una sola pantalla.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
