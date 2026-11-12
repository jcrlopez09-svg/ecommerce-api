import { cookies } from "next/headers";
import type { User } from "@/types";

/**
 * Gestión de la sesión del cliente.
 *
 * El token de Sanctum NUNCA viaja al navegador: se guarda en una cookie
 * httpOnly que solo pueden leer los Route Handlers, Server Actions y
 * Server Components del backend Next.js.
 */

export const SESSION_COOKIE = "ecom_session";

export interface SessionPayload {
  token: string;
  user: User;
}

/** Opciones de la cookie de sesión (httpOnly = inaccesible desde JS del navegador). */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Lee y deserializa la cookie de sesión. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionPayload;
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Exige sesión; devuelve el payload o null si no hay token válido. */
export async function requireSession(): Promise<SessionPayload | null> {
  return getSession();
}
