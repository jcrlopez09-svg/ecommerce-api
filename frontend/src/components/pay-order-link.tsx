import Link from "next/link";

/** Enlace a la página de pago para órdenes pendientes. */
export default function PayOrderLink({ orderId }: { orderId: number }) {
  return (
    <Link
      href={`/orders/${orderId}/pay`}
      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
    >
      Pagar ahora
    </Link>
  );
}
