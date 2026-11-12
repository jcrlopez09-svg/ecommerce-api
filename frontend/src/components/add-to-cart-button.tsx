"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { CartItem } from "@/types";

interface Props {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
  compact?: boolean;
}

/** Botón que agrega el producto al carrito (estado local del cliente). */
export default function AddToCartButton({ product, disabled, compact }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={
        compact
          ? "rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          : "w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      }
    >
      {disabled ? "Sin stock" : added ? "✓ Agregado" : "Agregar al carrito"}
    </button>
  );
}
