import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSession } from "@/lib/session";

/**
 * POST /api/orders/[id]/payment
 *
 * Inicia el pago de una orden propia llamando al endpoint
 * POST /api/orders/{order}/payment de la API con el token de la cookie
 * httpOnly y devuelve el client_secret para confirmar con Stripe.js.
 * El importe nunca lo envía el cliente: la API lo calcula del total de la orden.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json(
      { success: false, message: "Identificador de orden inválido." },
      { status: 400 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Debes iniciar sesión para pagar." },
      { status: 401 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "No fue posible conectar con la API para iniciar el pago. Inténtalo más tarde.",
      },
      { status: 503 },
    );
  }

  const payload = (await upstream.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: { client_secret?: string; payment?: { status?: string } };
  } | null;

  if (!upstream.ok || !payload?.success || !payload.data?.client_secret) {
    return NextResponse.json(
      {
        success: false,
        message: payload?.message ?? "No fue posible iniciar el pago.",
      },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  return NextResponse.json({
    success: true,
    message: payload.message,
    data: {
      order_id: orderId,
      client_secret: payload.data.client_secret,
    },
  });
}
