"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { createOrderAction } from "@/actions/orders";
import { formatPrice } from "@/lib/format";
import StripePaymentForm from "@/components/stripe-payment-form";

/**
 * Cliente de checkout:
 * 1. Muestra el resumen del carrito (estado local).
 * 2. Mutación: crea la orden en la API mediante Server Action.
 * 3. Monta el formulario de Stripe (PaymentElement) con el client_secret.
 */
export default function CheckoutClient({ isLogged }: { isLogged: boolean }) {
  const router = useRouter();
  const { items, ready, total, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ orderId: number; clientSecret: string } | null>(
    null,
  );

  const apiItems = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    [items],
  );

  function handleCreateOrder() {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction(apiItems);

      if (!result.ok || !result.order) {
        setError(result.message);
        return;
      }

      // La orden se creó: pedir el client_secret vía Route Handler
      // (el token viaja solo entre servidores gracias a la cookie httpOnly).
      try {
        const response = await fetch(`/api/orders/${result.order.id}/payment`, {
          method: "POST",
          headers: { Accept: "application/json" },
        });
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data?: { client_secret?: string };
        };

        if (!response.ok || !payload.success || !payload.data?.client_secret) {
          // La orden existe pero el pago no pudo iniciarse: se puede reintentar
          // desde "Mis órdenes".
          setError(
            payload.message ??
              "La orden se creó, pero no fue posible iniciar el pago. Puedes reintentarlo desde Mis órdenes.",
          );
          return;
        }

        // El carrito ya se convirtió en orden: vaciar estado local.
        clear();
        setPayment({
          orderId: result.order.id,
          clientSecret: payload.data.client_secret,
        });
        router.refresh();
      } catch {
        setError(
          "La orden se creó, pero falló la comunicación al iniciar el pago. Reinténtalo desde Mis órdenes.",
        );
      }
    });
  }

  // Paso 2: formulario de pago de Stripe ya con client_secret activo.
  if (payment) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          <strong>Orden #{payment.orderId} creada.</strong> Completa el pago con
          Stripe para confirmar tu compra.
        </div>
        <StripePaymentForm
          orderId={payment.orderId}
          clientSecret={payment.clientSecret}
        />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        Cargando carrito…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
        <span className="text-4xl" aria-hidden>
          🧾
        </span>
        <h3 className="text-lg font-semibold">No hay nada que pagar</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Agrega productos al carrito para continuar con el checkout.
        </p>
        <Link
          href="/products"
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <span className="font-semibold tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Total a pagar
          </span>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(total)}
          </span>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}

        {isLogged ? (
          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={isPending}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {isPending ? "Creando orden…" : "Crear orden y pagar"}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Necesitas una cuenta para completar la compra.
            </p>
            <Link
              href="/login?next=%2Fcheckout"
              className="rounded-lg bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Iniciar sesión para continuar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
