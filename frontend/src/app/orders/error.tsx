"use client";

import ErrorCard from "@/components/error-card";

/** Límite de error del segmento /orders. */
export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="No pudimos cargar tus órdenes"
      error={error}
      reset={reset}
    />
  );
}
