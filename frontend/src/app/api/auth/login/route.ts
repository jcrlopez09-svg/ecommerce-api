import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, ApiError } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * POST /api/auth/login
 *
 * Proxy seguro hacia POST /api/login de la API Laravel.
 * El token de Sanctum se guarda en una cookie httpOnly: el navegador
 * nunca lo ve y el JS cliente no puede robarlo (XSS).
 */
export async function POST(request: NextRequest) {
  let credentials: { email?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Cuerpo de la solicitud inválido." },
      { status: 400 },
    );
  }

  if (!credentials.email || !credentials.password) {
    return NextResponse.json(
      { success: false, message: "Correo y contraseña son obligatorios." },
      { status: 422 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "No fue posible conectar con el servidor de la API. Inténtalo más tarde.",
      },
      { status: 503 },
    );
  }

  const payload = (await upstream.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: { user?: { id: number; name: string; email: string }; token?: string };
  } | null;

  if (!upstream.ok || !payload?.success || !payload.data?.token) {
    return NextResponse.json(
      {
        success: false,
        message: payload?.message ?? "Las credenciales son incorrectas.",
      },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  const response = NextResponse.json({
    success: true,
    message: "Inicio de sesión correcto.",
    data: { user: payload.data.user },
  });

  response.cookies.set(
    SESSION_COOKIE,
    JSON.stringify({ token: payload.data.token, user: payload.data.user }),
    sessionCookieOptions(60 * 60 * 24 * 7), // 7 días
  );

  return response;
}
