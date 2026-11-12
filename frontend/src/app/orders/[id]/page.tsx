import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, getOrder } from "@/lib/api";
import { getSession } from "@/lib/session";
import { formatPrice, formatDateTime } from "@/lib/format";
import PayOrderLink from "@/components/pay-order-link";
import OrderStatusPoller from "@/components/order-status-poller";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Detalle de una orden propia (protegida). */
export default async function OrderDetailPage({ params }: PageProps) {
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

  const paid = order.status === "paid";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <OrderStatusPoller orderId={order.id} initialStatus={order.status} />

      <nav aria-label="Miga de pan" className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/orders" className="hover:underline">
          Mis órdenes
        </Link>
        <span aria-hidden> / </span>
        <span className="text-neutral-700 dark:text-neutral-300">Orden #{order.id}</span>
      </nav>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Orden #{order.id}</h1>
          <span
            className={
              paid
                ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }
          >
            {paid ? "Pagada" : "Pendiente de pago"}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Creada el {formatDateTime(order.created_at)}
        </p>

        <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
          {order.items?.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <div>
                <Link
                  href={`/products/${item.product_id}`}
                  className="font-medium hover:underline"
                >
                  {item.product?.name ?? `Producto #${item.product_id}`}
                </Link>
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
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(order.total)}
          </span>
        </div>

        {order.payments && order.payments.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              Intentos de pago (Stripe)
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {order.payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
                >
                  <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {payment.transaction_id ?? "—"}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">{formatPrice(payment.amount)}</span>
                    <span
                      className={
                        payment.status === "succeeded"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : payment.status === "failed"
                            ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }
                    >
                      {payment.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!paid ? (
          <div className="mt-6 flex justify-end">
            <PayOrderLink orderId={order.id} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
