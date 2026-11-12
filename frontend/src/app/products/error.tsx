"use client";

import ErrorCard from "@/components/error-card";

/** Límite de error del segmento /products. */
export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="No pudimos cargar el catálogo"
      error={error}
      reset={reset}
    />
  );
}
