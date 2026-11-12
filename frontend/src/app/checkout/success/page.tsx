import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, getOrder } from "@/lib/api";
import { getSession } from "@/lib/session";
import { formatPrice, formatDateTime } from "@/lib/format";
import OrderStatusPoller from "@/components/order-status-poller";

export const metadata: Metadata = { title: "Compra confirmada" };

/**
 * Confirmación de compra (protegida: requiere sesión).
 *
 * - Obtiene la orden desde la API en servidor con el token de la cookie.
 * - Si Stripe ya confirmó el pago (redirect_status=succeeded) se muestra
 *   la confirmación aunque la orden siga "pending" hasta que llegue el
 *   webhook firmado a la API (diseño seguro).
 * - OrderStatusPoller refresca la UI cuando el webhook marca la orden pagada.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; redirect_status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fcheckout");

  const { order_id: orderIdParam, redirect_status: redirectStatus } =
    await searchParams;

  if (!orderIdParam || !/^\d+$/.test(orderIdParam)) notFound();

  let order;
  try {
    order = await getOrder(orderIdParam, session);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const stripeSucceeded = redirectStatus === "succeeded";
  const paid = order.status === "paid";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <OrderStatusPoller orderId={order.id} initialStatus={order.status} />

      <div
        className={
          paid || stripeSucceeded
            ? "flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/50"
            : "flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/50"
        }
      >
        <span className="text-5xl" aria-hidden>
          {paid || stripeSucceeded ? "✅" : "⏳"}
        </span>
        <h1 className="text-2xl font-bold">
          {paid
            ? "¡Compra confirmada!"
            : stripeSucceeded
              ? "Pago recibido correctamente"
              : "Pago en proceso"}
        </h1>
        <p className="text-sm">
          {paid
            ? "Tu orden fue marcada como pagada por la API tras la confirmación del webhook de Stripe."
            : stripeSucceeded
              ? "Stripe confirmó el pago. La orden pasará a «Pagada» cuando la API reciba el webhook firmado (payment_intent.succeeded); esta página se actualiza automáticamente."
              : "Si acabas de pagar, la confirmación puede tardar unos segundos en llegar."}
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Orden #{order.id}</h2>
          <span
            className={
              paid
                ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }
          >
            {paid ? "Pagada" : "Pendiente"}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {formatDateTime(order.created_at)}
        </p>

        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
          {order.items?.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <div>
                <p className="font-medium">
                  {item.product?.name ?? `Producto #${item.product_id}`}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="font-semibold tabular-nums">
                {formatPrice(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <span className="font-semibold">Total pagado</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(order.total)}
          </span>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/orders"
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Ver mis órdenes
        </Link>
        <Link
          href="/products"
          className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
