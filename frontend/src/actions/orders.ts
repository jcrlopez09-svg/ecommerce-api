"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Order } from "@/types";

export interface CreateOrderResult {
  ok: boolean;
  message: string;
  order?: { id: number; total: string; status: string };
}

/**
 * Server Action: crea la orden en la API (mutación autenticada).
 *
 * Tras la mutación se invalidan las cachés para evitar interfaces
 * desactualizadas:
 * - revalidateTag("products"): el stock del catálogo cambió.
 * - revalidatePath("/orders") y "/orders/[id]": aparece la nueva orden.
 */
export async function createOrderAction(
  items: { product_id: number; quantity: number }[],
): Promise<CreateOrderResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      message: "Tu sesión expiró. Inicia sesión nuevamente para continuar.",
    };
  }

  const cleanItems = items
    .filter(
      (i) => Number.isInteger(i.product_id) && Number.isInteger(i.quantity) && i.quantity > 0,
    )
    .map((i) => ({ product_id: i.product_id, quantity: i.quantity }));

  if (cleanItems.length === 0) {
    return { ok: false, message: "El carrito está vacío." };
  }

  try {
    const envelope = await apiFetch<Order>("/orders", {
      method: "POST",
      session,
      body: { items: cleanItems },
    });

    const order = envelope.data;

    // Mutación exitosa → invalidar datos cacheados dependientes.
    // expire: 0 → la siguiente petición no sirve stock desactualizado.
    await revalidateTag("products", { expire: 0 });
    await revalidatePath("/orders", "page");
    await revalidatePath("/products", "page");
    await revalidatePath(`/orders/${order?.id ?? ""}`, "page");
    await revalidatePath("/checkout", "page");

    return {
      ok: true,
      message: envelope.message ?? "Orden creada correctamente.",
      order: order
        ? { id: order.id, total: order.total, status: order.status }
        : undefined,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return {
        ok: false,
        message: "Tu sesión expiró. Inicia sesión nuevamente para continuar.",
      };
    }
    return {
      ok: false,
      message:
        error instanceof ApiError
          ? error.message
          : "No fue posible crear la orden. Inténtalo nuevamente.",
    };
  }
}

export interface OrderStatusResult {
  ok: boolean;
  status?: string;
  message?: string;
}

/** Consulta el estado actual de una orden propia (para sondeo post-pago). */
export async function getOrderStatusAction(
  orderId: number,
): Promise<OrderStatusResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Sesión expirada." };
  }

  try {
    const envelope = await apiFetch<Order>(`/orders/${orderId}`, { session });
    return { ok: true, status: envelope.data?.status };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError ? error.message : "Error consultando la orden.",
    };
  }
}
