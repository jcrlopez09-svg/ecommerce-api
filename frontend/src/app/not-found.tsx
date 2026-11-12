import Link from "next/link";

/** Pantalla 404 global (productos inexistentes, rutas inválidas, etc.). */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-5xl" aria-hidden>
        🔍
      </span>
      <h2 className="text-xl font-bold">Página no encontrada</h2>
      <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        El recurso que buscas no existe o ya no está disponible.
      </p>
      <Link
        href="/products"
        className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
