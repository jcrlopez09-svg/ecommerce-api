import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/add-to-cart-button";

/** Tarjeta de producto del catálogo (presentacional, renderizada en servidor). */
export default function ProductCard({ product }: { product: Product }) {
  const price = parseFloat(product.price);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <Link
        href={`/products/${product.id}`}
        className="flex h-36 items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700"
        aria-label={`Ver ${product.name}`}
      >
        <span className="text-4xl" aria-hidden>
          🛍️
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${product.id}`}
            className="font-semibold leading-tight hover:underline"
          >
            {product.name}
          </Link>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {outOfStock ? "Agotado" : `${product.stock} en stock`}
          </span>
        </div>

        {product.description ? (
          <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(price)}
          </span>
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price,
              stock: product.stock,
            }}
            disabled={outOfStock}
            compact
          />
        </div>
      </div>
    </article>
  );
}
