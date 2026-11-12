"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrderStatusAction } from "@/actions/orders";

/**
 * Sondea el estado de la orden tras el pago. Cuando el webhook de Stripe
 * confirma (payment_intent.succeeded), refresca los Server Components
 * para que la UI no quede desactualizada tras la mutación.
 */
export default function OrderStatusPoller({
  orderId,
  initialStatus,
}: {
  orderId: number;
  initialStatus: string;
}) {
  const router = useRouter();
  const attempts = useRef(0);
  const settled = useRef(initialStatus === "paid");

  useEffect(() => {
    if (settled.current) return;

    const interval = window.setInterval(async () => {
      attempts.current += 1;
      const result = await getOrderStatusAction(orderId);

      if (result.ok && result.status === "paid") {
        settled.current = true;
        window.clearInterval(interval);
        router.refresh();
        return;
      }

      // Deja de sondear tras ~1 minuto para no gastar recursos.
      if (attempts.current >= 15) {
        window.clearInterval(interval);
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [orderId, router]);

  return null;
}
