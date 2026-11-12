import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import OrderList from "@/components/order-list";
import { OrdersSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Mis órdenes" };

/**
 * Historial de compras (ruta protegida).
 *
 * - La sesión se valida en servidor: sin cookie httpOnly → redirect a login.
 * - El listado (sección pesada) se carga con <Suspense> + streaming y
 *   loading.tsx cubre la navegación hacia la ruta.
 */
export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Forders");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis órdenes</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Historial de compras de {session.user.name}.
        </p>
      </div>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrderList session={session} />
      </Suspense>
    </div>
  );
}
