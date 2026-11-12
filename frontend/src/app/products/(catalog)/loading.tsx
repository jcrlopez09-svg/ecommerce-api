import { GridSkeleton } from "@/components/skeletons";

/** Skeleton del catálogo mientras navega a /products (UX fluida).
 *  Solo envuelve el listado del route group (catalog), no la ficha [id]. */
export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <GridSkeleton cards={8} />
    </div>
  );
}
