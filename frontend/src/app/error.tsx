"use client";

import { useEffect } from "react";

/**
 * Límite de error raíz: captura errores no manejados de cualquier
 * segmento que no tenga su propio error.tsx.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí se reportaría el error a un servicio de monitoreo (Sentry, etc.).
    console.error("Error capturado por error.tsx raíz:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-5xl" aria-hidden>
        🚨
      </span>
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        Ocurrió un error inesperado al cargar esta sección. Puedes reintentar
        o volver al catálogo.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Reintentar
        </button>
        <a
          href="/products"
          className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Ir al catálogo
        </a>
      </div>
    </div>
  );
}
