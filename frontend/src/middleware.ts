import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de protección de rutas.
 *
 * - Rutas protegidas (/orders, /checkout): sin cookie de sesión → 307 a
 *   /login con retorno. El redirect ocurre ANTES de renderizar nada
 *   (estado HTTP correcto, sin shell filtrado, sin meta-refresh).
 * - Usuario autenticado en /login o /register → 307 a /products.
 *
 * Nota: el middleware solo comprueba la PRESENCIA de la cookie; la
 * validez real del token la verifica la API en cada petición y las
 * páginas vuelven a comprobar la sesión en servidor (defensa en
 * profundidad).
 */

const PROTECTED_PATTERNS = [/^\/orders(\/|$)/, /^\/checkout(\/|$)/];
const AUTH_PAGES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has("ecom_session");

  if (!hasSession && PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/checkout/:path*", "/login", "/register"],
};
