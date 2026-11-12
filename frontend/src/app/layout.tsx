import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: {
    default: "DevStore — E-Commerce",
    template: "%s · DevStore",
  },
  description:
    "Tienda en línea construida con Next.js y Laravel: catálogo, carrito, pagos con Stripe e historial de compras.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang="es" y fuentes del sistema (sin descargas externas → mejor LCP/Web Vitals).
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-neutral-200 py-6 dark:border-neutral-800">
            <p className="mx-auto max-w-6xl px-4 text-xs text-neutral-500 dark:text-neutral-400">
              DevStore · Next.js App Router + Laravel 12 API REST + Stripe ·
              Proyecto de demostración académica.
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
