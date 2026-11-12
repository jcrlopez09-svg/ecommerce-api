import type { Metadata } from "next";
import CartView from "@/components/cart-view";

export const metadata: Metadata = { title: "Carrito" };

/** Carrito de compras (estado local del cliente, persistido en localStorage). */
export default function CartPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tu carrito</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Revisa los productos antes de continuar al pago.
        </p>
      </div>
      <CartView />
    </div>
  );
}
