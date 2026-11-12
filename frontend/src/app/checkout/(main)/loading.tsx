/** Skeleton de /checkout (requisito de rendimiento en rutas clave).
 *  Route group (main): no envuelve /checkout/success. */
export default function CheckoutLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-16 animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-16 animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-32 animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-12 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
