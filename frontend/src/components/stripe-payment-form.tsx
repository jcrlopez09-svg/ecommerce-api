"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Formulario de pago con Stripe Payment Element.
 * El client_secret lo emite la API (monto calculado en servidor);
 * la confirmación del pago ocurre aquí con Stripe.js.
 */

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

function PaymentForm({ orderId, onDone }: { orderId: number; onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    // redirect: "if_required" evita el redirect de Stripe y nos deja
    // manejar el resultado aquí (mejor UX y control de errores).
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (confirmError) {
      // Tarjeta rechazada, datos incompletos, etc.
      setError(confirmError.message ?? "El pago no pudo confirmarse.");
      setProcessing(false);
      return;
    }

    if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
      onDone();
      router.push(
        `/checkout/success?order_id=${orderId}&redirect_status=${paymentIntent.status}`,
      );
      return;
    }

    setError("El pago no se confirmó. Inténtalo nuevamente.");
    setProcessing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
          paymentMethodOrder: ["card"],
        }}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {processing ? "Procesando pago…" : "Pagar ahora"}
      </button>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Entorno de pruebas: usa la tarjeta{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
          4242 4242 4242 4242
        </code>
        , cualquier fecha futura y CVC de 3 dígitos.
      </p>
    </form>
  );
}

export default function StripePaymentForm({
  orderId,
  clientSecret,
}: {
  orderId: number;
  clientSecret: string;
}) {
  const options = useMemo(
    () => ({ clientSecret, appearance: { theme: "stripe" as const } }),
    [clientSecret],
  );

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
      >
        Falta configurar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en el entorno del
        frontend.
      </p>
    );
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-4 text-lg font-semibold">Pago con Stripe</h2>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          orderId={orderId}
          onDone={() => {
            /* el router.push ya navega a la confirmación */
          }}
        />
      </Elements>
    </section>
  );
}
