# E-Commerce REST API (Laravel 12)

API REST para registro y autenticación de clientes, catálogo de productos, órdenes y pagos mediante Stripe.

## Requisitos

- PHP 8.2 o superior y extensiones requeridas por Laravel.
- Composer 2.
- MySQL 8+ (o versión compatible).
- Node.js/npm solo si se desea compilar los assets de la página de bienvenida.
- Cuenta Stripe para usar claves de prueba.

## Instalación local

1. Instala dependencias:

   ```bash
   composer install
   ```

2. Copia `.env.example` como `.env` y configura `APP_KEY`, MySQL y Stripe:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Crea la base de datos `ecommerce_api` (o usa el nombre que configures en `DB_DATABASE`). Completa `DB_USERNAME` y `DB_PASSWORD`.

3. Configura Stripe en `.env` con claves **de prueba**, nunca publiques claves reales:

   ```dotenv
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_CURRENCY=usd
   ```

4. Ejecuta migraciones y productos de ejemplo:

   ```bash
   php artisan migrate:fresh --seed
   ```

   `migrate:fresh` elimina las tablas existentes; úsalo solo en una base de datos local de desarrollo que puedas borrar.

5. Inicia el servidor:

   ```bash
   php artisan serve
   ```

   Base URL local: `http://127.0.0.1:8000`.

## Endpoints

| Método | Endpoint | Autenticación | Descripción |
|---|---|---|---|
| POST | `/api/register` | No | Registrar cliente y devolver token |
| POST | `/api/login` | No | Iniciar sesión y devolver token |
| POST | `/api/logout` | Sanctum | Revocar el token actual |
| GET | `/api/products` | No | Listar productos activos |
| GET | `/api/products/{product}` | No | Consultar un producto activo |
| POST | `/api/products` | Sanctum | Crear producto |
| PUT | `/api/products/{product}` | Sanctum | Actualizar producto |
| DELETE | `/api/products/{product}` | Sanctum | Eliminar producto |
| POST | `/api/orders` | Sanctum | Crear orden con `items: [{product_id, quantity}]` |
| GET | `/api/orders` | Sanctum | Historial del cliente autenticado |
| GET | `/api/orders/{order}` | Sanctum | Consultar una orden propia |
| POST | `/api/orders/{order}/payment` | Sanctum | Crear PaymentIntent y devolver `client_secret` |
| POST | `/api/stripe/webhook` | Firma Stripe | Confirmar eventos de pago de Stripe |

Para rutas protegidas, envía `Authorization: Bearer <token>` y `Accept: application/json`.

## Flujo de pago

El endpoint de pago calcula el importe desde el total guardado en la orden; no acepta un importe proporcionado por el cliente. Devuelve un `client_secret` para que un cliente web o móvil confirme el pago usando Stripe.js/SDK. La orden solo pasa a `paid` cuando llega un webhook firmado `payment_intent.succeeded`.

Configura en Stripe un endpoint webhook apuntando a `https://TU_HOST/api/stripe/webhook`, suscribiéndote al menos a `payment_intent.succeeded` y `payment_intent.payment_failed`. Para desarrollo local, puedes usar Stripe CLI para reenviar eventos y copiar el `whsec_...` a `STRIPE_WEBHOOK_SECRET`. No expongas el secreto del webhook ni claves secretas.

## Swagger / OpenAPI

Tras instalar dependencias, genera la documentación actualizada:

```bash
php artisan l5-swagger:generate
```

Abre `http://127.0.0.1:8000/api/documentation`.

## Frontend Next.js

El proyecto incluye un frontend de referencia en `frontend/` (Next.js 16 App
Router) que consume esta API con autenticación por cookie httpOnly, carrito,
checkout con Stripe Elements e historial protegido. Ver `frontend/README.md`
para instalación y arquitectura. La configuración CORS de la API
(`config/cors.php`) permite el origen `http://localhost:3000`.

## Pruebas

```bash
php artisan test
```

Las pruebas de pago contra Stripe deben usar claves de prueba o mocks; no uses datos de tarjetas reales en pruebas automatizadas.
