import Link from "next/link";
import { getOrders } from "@/lib/api";
import type { SessionPayload } from "@/lib/session";
import { formatPrice, formatDateTime } from "@/lib/format";
import EmptyState from "@/components/empty-state";
import PayOrderLink from "@/components/pay-order-link";

/**
 * Historial de órdenes: componente de servidor asíncrono, montado dentro
 * de <Suspense> (sección pesada con streaming).
 */
export default async function OrderList({ session }: { session: SessionPayload }) {
  const orders = await getOrders(session);

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes órdenes"
        description="Cuando realices tu primera compra aparecerá aquí."
        action={
          <Link
            href="/products"
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Explorar catálogo
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/orders/${order.id}`}
              className="font-semibold hover:underline"
            >
              Orden #{order.id}
            </Link>
            <span
              className={
                order.status === "paid"
                  ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }
            >
              {order.status === "paid" ? "Pagada" : "Pendiente"}
            </span>
          </div>

          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {formatDateTime(order.created_at)} ·{" "}
            {order.items?.length ?? 0} {order.items?.length === 1 ? "artículo" : "artículos"}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatPrice(order.total)}
            </span>
            {order.status === "pending" ? <PayOrderLink orderId={order.id} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
