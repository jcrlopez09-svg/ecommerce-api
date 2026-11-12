/** Esqueletos de carga ( skeletons ) para loading.tsx y fallbacks de Suspense. */

export function GridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="h-36 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-2 flex items-center justify-between">
              <div className="h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-9 w-28 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex flex-col gap-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          key={index}
          className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="mt-3 h-3 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-7 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}
