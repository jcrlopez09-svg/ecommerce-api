"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";

/** Vista del carrito: agregar/quitar productos, ajustar cantidades (estado local). */
export default function CartView() {
  const { items, ready, total, count, updateQuantity, removeItem, clear } = useCart();

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
          🛒
        </span>
        <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Explora el catálogo y agrega productos para continuar.
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
        {items.map((item) => {
          const itemTotal = item.price * item.quantity;
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 py-4 first:pt-0"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 text-xl dark:from-neutral-800 dark:to-neutral-700" aria-hidden>
                🛍️
              </span>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatPrice(item.price)} · {item.stock} disponibles
                </p>
              </div>

              <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${item.name}`}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1.5 text-lg leading-none transition hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Agregar una unidad de ${item.name}`}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="px-3 py-1.5 text-lg leading-none transition hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                >
                  +
                </button>
              </div>

              <span className="w-20 text-right font-semibold tabular-nums">
                {formatPrice(itemTotal)}
              </span>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Eliminar ${item.name} del carrito`}
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {count} {count === 1 ? "producto" : "productos"} en el carrito
        </p>
        <p className="text-lg font-bold">
          Total:{" "}
          <span className="text-emerald-700 dark:text-emerald-400">
            {formatPrice(total)}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Vaciar carrito
        </button>
        <Link
          href="/checkout"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Continuar al pago →
        </Link>
      </div>
    </div>
  );
}
