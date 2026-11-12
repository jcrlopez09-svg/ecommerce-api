"use client";

import { useEffect } from "react";

/** Tarjeta de error reutilizable para los error.tsx de cada segmento. */
export default function ErrorCard({
  title,
  error,
  reset,
}: {
  title: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(`${title}:`, error);
  }, [title, error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900 dark:bg-red-950/40">
      <span className="text-4xl" aria-hidden>
        ⚠️
      </span>
      <h2 className="text-lg font-bold text-red-700 dark:text-red-300">{title}</h2>
      <p className="max-w-md text-sm text-red-600 dark:text-red-400">
        {error.message ||
          "No fue posible cargar la información desde la API. Verifica que el backend esté en ejecución."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
      >
        Reintentar
      </button>
    </div>
  );
}
