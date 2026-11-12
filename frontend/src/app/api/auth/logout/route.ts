import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * POST /api/auth/logout
 *
 * Revoca el token actual en la API Laravel (POST /api/logout con Bearer)
 * y limpia la cookie httpOnly local.
 */
export async function POST() {
  const session = await getSession();

  if (session?.token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        cache: "no-store",
      });
    } catch {
      // Aunque la API no responda, la sesión local se cierra igualmente.
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente.",
  });

  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));

  return response;
}
