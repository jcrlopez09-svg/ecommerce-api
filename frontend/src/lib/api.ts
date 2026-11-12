import type { ApiEnvelope, Order, Product } from "@/types";
import type { SessionPayload } from "@/lib/session";

/**
 * Cliente server-side hacia la API Laravel.
 * Se usa desde Server Components, Server Actions y Route Handlers.
 */

export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:8000/api";

/** Error con mensaje amigable devuelto por la API o por fallos de red. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  session?: SessionPayload | null;
  /** Caching de datos públicos (catálogo) con tag para revalidar tras mutaciones. */
  tags?: string[];
  revalidate?: number;
}

/** Ejecuta una petición a la API y normaliza la respuesta/errores. */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, session, tags, revalidate } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const init: RequestInit = { method, headers };

  if (tags || revalidate !== undefined) {
    // Datos públicos: se cachean en el Data Cache de Next y se invalidan
    // con revalidateTag() cuando una mutación los afecta (ej.: stock).
    init.next = { tags, revalidate };
  } else if (session) {
    // Datos por usuario: nunca se cachean.
    init.cache = "no-store";
  }

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    // La API no está alcanzable (caída, red, etc.).
    throw new ApiError(
      "No fue posible conectar con el servidor de la API. Inténtalo más tarde.",
      503,
    );
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Respuesta no JSON (HTML de error de proxy, 500 crudo, etc.).
  }

  if (!response.ok) {
    const message =
      envelope?.message ??
      (response.status === 401
        ? "No autenticado o sesión expirada."
        : "Ocurrió un error inesperado en la API.");
    throw new ApiError(message, response.status);
  }

  if (!envelope?.success) {
    throw new ApiError(
      envelope?.message ?? "La API rechazó la solicitud.",
      response.status,
    );
  }

  return envelope;
}

/** Catálogo público (cacheado con tag "products"). */
export async function getProducts(): Promise<Product[]> {
  const envelope = await apiFetch<Product[]>("/products", {
    tags: ["products"],
    revalidate: 60,
  });
  return envelope.data ?? [];
}

/** Detalle público de un producto. Lanza ApiError 404 si no existe/inactivo. */
export async function getProduct(id: number | string): Promise<Product> {
  const envelope = await apiFetch<Product>(`/products/${id}`, {
    tags: ["products"],
    revalidate: 60,
  });
  if (!envelope.data) {
    throw new ApiError("Producto no encontrado.", 404);
  }
  return envelope.data;
}

/** Historial de órdenes del usuario autenticado. */
export async function getOrders(session: SessionPayload): Promise<Order[]> {
  const envelope = await apiFetch<Order[]>("/orders", { session });
  return envelope.data ?? [];
}

/** Detalle de una orden propia (con items y pagos). */
export async function getOrder(
  id: number | string,
  session: SessionPayload,
): Promise<Order> {
  const envelope = await apiFetch<Order>(`/orders/${id}`, { session });
  if (!envelope.data) {
    throw new ApiError("Orden no encontrada.", 404);
  }
  return envelope.data;
}
