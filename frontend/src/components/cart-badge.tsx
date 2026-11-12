"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

/** Contador del carrito (estado local del cliente). */
export default function CartBadge() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Carrito con ${count} productos`}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
