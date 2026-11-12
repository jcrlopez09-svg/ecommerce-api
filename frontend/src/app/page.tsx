import Link from "next/link";

/** Página de inicio estática (SSG): LCP inmediato y buen puntaje Web Vitals. */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-10 py-12 text-center">
      <div className="flex max-w-3xl flex-col items-center gap-5">
        <span className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          Next.js App Router · Laravel 12 · Stripe
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Tu tienda de tecnología,
          <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            con pagos seguros
          </span>
        </h1>
        <p className="max-w-xl text-neutral-600 dark:text-neutral-400">
          Explora el catálogo, arma tu carrito y paga con Stripe. Consulta tu
          historial de compras en cualquier momento desde tu cuenta.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Ver catálogo
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-neutral-200 px-6 py-3 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Crear cuenta
          </Link>
        </div>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: "⚡",
            title: "Rápida por diseño",
            text: "Server Components, streaming con Suspense y carga instantánea de rutas.",
          },
          {
            icon: "🔒",
            title: "Sesión protegida",
            text: "Token guardado en cookie httpOnly: invisible para el navegador.",
          },
          {
            icon: "💳",
            title: "Pagos con Stripe",
            text: "El importe se calcula en el servidor; confirmación con Stripe.js.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="text-2xl" aria-hidden>
              {feature.icon}
            </span>
            <h2 className="mt-2 font-semibold">{feature.title}</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {feature.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
