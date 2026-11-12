import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout-client";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout" };

/**
 * Checkout (route group (main)).
 *
 * Resumen del carrito + creación de la orden (mutación) + inicio del pago
 * con Stripe. La sesión se comprueba en servidor (cookie httpOnly), pero
 * la página es renderizable para invitados con carrito (CTA de login).
 *
 * El loading.tsx de este grupo solo envuelve /checkout; /checkout/success
 * queda fuera del boundary para que notFound() genere un 404 real.
 */
export default async function CheckoutPage() {
  const session = await getSession();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Crea tu orden y paga de forma segura con Stripe.
        </p>
      </div>
      <CheckoutClient isLogged={Boolean(session)} />
    </div>
  );
}
