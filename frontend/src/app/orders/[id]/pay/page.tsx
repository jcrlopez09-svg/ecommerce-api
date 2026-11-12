import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, getOrder } from "@/lib/api";
import { getSession } from "@/lib/session";
import { formatPrice } from "@/lib/format";
import PayOrderClient from "@/components/pay-order-client";

export const metadata: Metadata = { title: "Pagar orden" };

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Pagar una orden pendiente existente (protegida).
 * Verifica propiedad en servidor y monta el formulario de Stripe.
 */
export default async function PayOrderPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Forders");

  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let order;
  try {
    order = await getOrder(id, session);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  if (order.status === "paid") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center dark:border-emerald-900 dark:bg-emerald-950/50">
        <span className="text-4xl" aria-hidden>
          ✅
        </span>
        <h1 className="text-xl font-bold">Esta orden ya fue pagada</h1>
        <p className="text-sm">
          Total: <strong>{formatPrice(order.total)}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pagar orden #{order.id}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Total a pagar:{" "}
          <strong className="text-neutral-900 dark:text-white">
            {formatPrice(order.total)}
          </strong>
        </p>
      </div>
      <PayOrderClient orderId={order.id} />
    </div>
  );
}
