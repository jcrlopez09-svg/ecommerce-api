# DevStore — Frontend Next.js (E-Commerce)

Frontend de la API REST de e-commerce (Laravel 12 + Sanctum + Stripe)
construido con **Next.js 16 (App Router)**, React 19, TypeScript y Tailwind CSS 4.

## Requisitos

- Node.js 20+ y npm.
- La API Laravel corriendo (ver `../README.md`), por defecto en `http://127.0.0.1:8000`.
- Clave publicable de Stripe (`pk_test_...`) para el formulario de pago.

## Instalación y ejecución

```bash
npm install
cp .env.example .env.local        # configura API_BASE_URL y la pk de Stripe
npm run dev                       # desarrollo: http://localhost:3000

# o producción:
npm run build
npm run start
```

Variables de entorno (`.env.local`):

| Variable | Descripción |
|---|---|
| `API_BASE_URL` | URL base de la API Laravel (`http://127.0.0.1:8000/api`). Solo servidor. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe para Stripe.js. |

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Home estática (landing). |
| `/products` | Público | Catálogo con streaming + Suspense. |
| `/products/[id]` | Público | Ficha de producto (404 si no existe/inactivo). |
| `/login`, `/register` | Público (redirige si hay sesión) | Autenticación. |
| `/cart` | Público | Carrito local (localStorage). |
| `/checkout` | Protegido (middleware 307) | Crear orden (mutación) + iniciar pago. |
| `/checkout/success` | Protegido | Confirmación de compra con sondeo de estado. |
| `/orders` | Protegido | Historial de compras (streaming + Suspense). |
| `/orders/[id]` | Protegido | Detalle de orden con pagos. |
| `/orders/[id]/pay` | Protegido | Pagar una orden pendiente (reintento). |

### Route Handlers internos (proxy seguro)

| Endpoint | Descripción |
|---|---|
| `POST /api/auth/register` | Proxy de registro; guarda token en cookie httpOnly. |
| `POST /api/auth/login` | Proxy de login; guarda token en cookie httpOnly. |
| `POST /api/auth/logout` | Revoca el token en la API y limpia la cookie. |
| `POST /api/orders/[id]/payment` | Obtiene el `client_secret` con el token de la cookie. |

## Arquitectura y decisiones

### Autenticación segura

- El **token de Sanctum nunca llega al navegador**: los Route Handlers
  (`src/app/api/auth/*`) llaman a la API Laravel y guardan el token en una
  cookie **httpOnly + SameSite=lax + Secure** (`src/lib/session.ts`).
- El middleware (`src/middleware.ts`) protege `/orders` y `/checkout` con
  redirects 307 reales y redirige usuarios autenticados fuera de login/register.
- Las páginas vuelven a validar la sesión en servidor (defensa en profundidad).
- Ventaja adicional: el proxy evita problemas de CORS al consumir la API
  desde el servidor de Next.

### Mutaciones asíncronas

- `createOrderAction` (`src/actions/orders.ts`, Server Action): crea la orden
  con `useTransition` en el cliente y estados de carga explícitos.
- Tras la mutación se invalidan las cachés para evitar interfaces
  desactualizadas:
  - `revalidateTag('products', { expire: 0 })` → stock fresco en el catálogo.
  - `revalidatePath('/orders', 'page')` etc. → la nueva orden aparece en el historial.
- Los datos públicos del catálogo se cachean con `next: { tags: ['products'], revalidate: 60 }`.

### Pago con Stripe

- El importe **siempre lo calcula la API** desde el total de la orden; el
  cliente solo recibe el `client_secret`.
- Confirmación en el navegador con `@stripe/react-stripe-js` (PaymentElement)
  y `redirect: 'if_required"` para manejar errores inline.
- La orden pasa a `paid` **solo** cuando la API recibe el webhook firmado
  `payment_intent.succeeded`; la página de confirmación sondea el estado
  (`OrderStatusPoller`) y se actualiza sola.

### Manejo de errores

- `error.tsx` por segmento (`/products`, `/orders`, `/checkout`) + raíz global,
  con botón de reintentar (`reset()`).
- `not-found.tsx` global; fichas inexistentes devuelven **404 HTTP real**.
- Errores de la API normalizados con `ApiError` (mensaje + status) y traducidos
  a mensajes en español.
- Los `loading.tsx` viven en **route groups** (`(catalog)`, `(main)`) para que
  el streaming del shell no convierta los 404 de las subrutas en 200.

## Rendimiento (Web Vitals / Lighthouse)

Evidencia completa en [`docs/lighthouse/README.md`](docs/lighthouse/README.md)
con los JSON generados por Lighthouse 12:

| Página | Performance | LCP | TBT | CLS |
|---|---|---|---|---|
| `/` | **98** | 0.8 s | 170 ms | 0 |
| `/products` | **97** | 0.8 s | 180 ms | 0.044 |

Técnicas: Server Components, streaming con `<Suspense>` en catálogo e
historial, `loading.tsx` en rutas clave, fuentes del sistema, caché con tags,
home prerenderizada.

## Pruebas de extremo a extremo (resumen)

Flujo verificado contra la API real: catálogo público (SSR con datos),
registro → cookie httpOnly → login → rutas protegidas (307/200/404 correctos),
creación de orden (stock descontado 10→8), orden visible en historial y
detalle, control de errores de pago (502 con claves placeholder) y de
validación (422), login incorrecto (401) y logout.

> El flujo completo de pago requiere claves **reales de prueba** de Stripe
> (`STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` en la API y
> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en el frontend). Con las claves
> placeholder actuales el endpoint responde 502 con mensaje controlado.
> Tarjeta de prueba: `4242 4242 4242 4242`.
