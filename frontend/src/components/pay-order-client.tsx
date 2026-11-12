"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StripePaymentForm from "@/components/stripe-payment-form";

/**
 * Página de pago de una orden existente (reintento desde "Mis órdenes").
 * Obtiene el client_secret a través del Route Handler autenticado.
 */
export default function PayOrderClient({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    (async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/payment`, {
          method: "POST",
          headers: { Accept: "application/json" },
        });
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data?: { client_secret?: string };
        };

        if (!response.ok || !payload.success || !payload.data?.client_secret) {
          setError(payload.message ?? "No fue posible iniciar el pago.");
          return;
        }
        setClientSecret(payload.data.client_secret);
      } catch {
        setError("No fue posible iniciar el pago. Inténtalo más tarde.");
      }
    })();
  }, [orderId]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-red-300 p-10 text-center dark:border-red-900">
        <span className="text-3xl" aria-hidden>
          ⚠️
        </span>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-28 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <p className="text-center text-sm text-neutral-500">
          Preparando el pago seguro…
        </p>
      </div>
    );
  }

  return <StripePaymentForm orderId={orderId} clientSecret={clientSecret} />;
}
