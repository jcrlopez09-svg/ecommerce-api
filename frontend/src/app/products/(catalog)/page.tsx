import { Suspense } from "react";
import type { Metadata } from "next";
import ProductList from "@/components/product-list";
import { GridSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Listado público de productos activos de la tienda.",
};

/**
 * Catálogo público (segmento (catalog)).
 *
 * El listado (sección pesada) se monta dentro de <Suspense>: el shell de la
 * página se envía de inmediato y los datos llegan por streaming mientras se
 * muestra el esqueleto. loading.tsx cubre la navegación hacia esta ruta.
 *
 * Este archivo vive en el route group (catalog) para que su loading.tsx
 * NO envuelva la ficha /products/[id]: así notFound() de la ficha produce
 * un 404 con estado HTTP correcto en lugar de un shell 200 por streaming.
 */
export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Productos activos disponibles en la tienda.
        </p>
      </div>

      <Suspense fallback={<GridSkeleton cards={8} />}>
        <ProductList />
      </Suspense>
    </div>
  );
}
