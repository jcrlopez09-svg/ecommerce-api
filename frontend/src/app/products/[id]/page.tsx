import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, getProduct } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/add-to-cart-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadProduct(id: string) {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

/** Metadatos SEO generados en servidor a partir del producto.
 *  notFound() se propaga (sin catch) para que el 404 se emita con el
 *  código de estado correcto antes de que el shell se transmita. */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  return {
    title: product.name,
    description: product.description ?? `Compra ${product.name} en DevStore.`,
  };
}

/** Detalle público de un producto. 404 si no existe o está inactivo. */
export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await loadProduct(id);
  const price = parseFloat(product.price);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Miga de pan" className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/products" className="hover:underline">
          Catálogo
        </Link>
        <span aria-hidden> / </span>
        <span className="text-neutral-700 dark:text-neutral-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
          <span className="text-7xl" aria-hidden>
            🛍️
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <span
              className={
                outOfStock
                  ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              }
            >
              {outOfStock ? "Agotado" : `${product.stock} disponibles`}
            </span>
          </div>

          <p className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {formatPrice(price)}
          </p>

          {product.description ? (
            <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">
              {product.description}
            </p>
          ) : null}

          <div className="mt-2">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price,
                stock: product.stock,
              }}
              disabled={outOfStock}
            />
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Al continuar al pago se creará una orden con el importe calculado
            en el servidor y podrás pagarla de forma segura con Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
