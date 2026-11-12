import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LoginForm from "@/components/login-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Iniciar sesión" };

/** Página de login. Si ya hay sesión, redirige al catálogo. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/products");

  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Inicia sesión para comprar y ver tu historial.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
