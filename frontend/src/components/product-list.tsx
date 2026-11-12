import { getProducts } from "@/lib/api";
import ProductCard from "@/components/product-card";
import EmptyState from "@/components/empty-state";

/**
 * Lista de productos: componente de servidor asíncrono.
 * Se monta dentro de <Suspense> en la página del catálogo para que la
 * interfaz no se bloquee mientras llegan los datos (streaming SSR).
 */
export default async function ProductList() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <EmptyState
        title="Sin productos por ahora"
        description="El catálogo está vacío. Vuelve más tarde."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
