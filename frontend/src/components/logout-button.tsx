"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Cierra la sesión: llama al Route Handler que revoca el token y limpia la cookie. */
export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("No fue posible cerrar la sesión.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cerrar sesión.");
      return;
    }

    startTransition(() => {
      // Refresca los Server Components (cabecera, datos protegidos).
      router.refresh();
      router.push("/products");
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {isPending ? "Saliendo…" : "Cerrar sesión"}
      </button>
      {error ? (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      ) : null}
    </div>
  );
}
