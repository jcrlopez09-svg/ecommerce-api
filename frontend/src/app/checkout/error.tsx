"use client";

import ErrorCard from "@/components/error-card";

/** Límite de error del segmento /checkout. */
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="No pudimos preparar el checkout"
      error={error}
      reset={reset}
    />
  );
}
