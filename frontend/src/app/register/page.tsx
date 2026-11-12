import { redirect } from "next/navigation";
import type { Metadata } from "next";
import RegisterForm from "@/components/register-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Crear cuenta" };

/** Página de registro. Si ya hay sesión, redirige al catálogo. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/products");

  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Regístrate para comprar y hacer seguimiento de tus órdenes.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <RegisterForm next={next} />
      </div>
    </div>
  );
}
