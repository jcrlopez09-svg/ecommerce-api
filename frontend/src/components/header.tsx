import Link from "next/link";
import { getSession } from "@/lib/session";
import CartBadge from "@/components/cart-badge";
import LogoutButton from "@/components/logout-button";

/** Cabecera global. Server Component: lee la sesión desde la cookie httpOnly. */
export default async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm text-white dark:bg-white dark:text-black">
            EC
          </span>
          <span className="hidden sm:inline">DevStore</span>
        </Link>

        <nav className="ml-4 flex items-center gap-1 text-sm font-medium">
          <Link
            href="/products"
            className="rounded-md px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            Catálogo
          </Link>
          {session ? (
            <Link
              href="/orders"
              className="rounded-md px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              Mis órdenes
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden text-sm text-neutral-500 md:inline dark:text-neutral-400">
                Hola, <strong>{session.user.name.split(" ")[0]}</strong>
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Crear cuenta
              </Link>
            </>
          )}
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
