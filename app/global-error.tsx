"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Algo ha ido mal</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 40,
              padding: "0 20px",
              borderRadius: 12,
              border: "none",
              background: "#1c1c1f",
              color: "#f4f4f5",
              fontSize: 14,
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
