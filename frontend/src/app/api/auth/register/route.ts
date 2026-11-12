import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * POST /api/auth/register
 *
 * Registra al usuario contra POST /api/register de la API Laravel y,
 * como la respuesta incluye el token, se guarda directamente en la
 * cookie httpOnly (sesión iniciada al registrarse).
 */
export async function POST(request: NextRequest) {
  let input: {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Cuerpo de la solicitud inválido." },
      { status: 400 },
    );
  }

  const { name, email, password, password_confirmation } = input;
  if (!name || !email || !password || !password_confirmation) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Nombre, correo, contraseña y su confirmación son obligatorios.",
      },
      { status: 422 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, password_confirmation }),
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
    errors?: Record<string, string[]>;
    data?: { user?: { id: number; name: string; email: string }; token?: string };
  } | null;

  if (!upstream.ok || !payload?.success || !payload.data?.token) {
    // 422 de Laravel: se traducen los errores de validación a un mensaje simple.
    const validation = payload?.errors;
    const firstError = validation
      ? Object.values(validation).flat()[0]
      : undefined;

    return NextResponse.json(
      {
        success: false,
        message:
          firstError ??
          payload?.message ??
          "No fue posible completar el registro.",
      },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  const response = NextResponse.json(
    {
      success: true,
      message: "Usuario registrado correctamente.",
      data: { user: payload.data.user },
    },
    { status: 201 },
  );

  response.cookies.set(
    SESSION_COOKIE,
    JSON.stringify({ token: payload.data.token, user: payload.data.user }),
    sessionCookieOptions(60 * 60 * 24 * 7),
  );

  return response;
}
