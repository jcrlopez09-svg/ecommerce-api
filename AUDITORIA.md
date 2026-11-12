# Auditoría técnica — E-Commerce API

## Cambios aplicados

- Se completó la migración de `orders` con `user_id`, `total` y `status`.- Se configuraron los atributos asignables, casts y relaciones de los modelos `Product`, `Payment` y `User`.
- Se completó `StripeService.php`, que originalmente no tenía la apertura `<?php` y por ello no declaraba una clase PHP ejecutable.
- Se implementó `POST /api/orders/{order}/payment` para crear un PaymentIntent desde el total calculado en el servidor, registrar el pago y devolver el `client_secret`.
- Se implementó `POST /api/stripe/webhook` con validación de firma y comprobación de importe/moneda antes de marcar una orden como pagada.
- Se añadieron variables de configuración de Stripe a `config/services.php` y `.env.example`.
- Se configuró Sanctum como esquema Bearer de OpenAPI y se actualizó el JSON estático de Swagger para incluir las rutas de pago.
- Se unificaron respuestas de error JSON de la API para validación, autenticación, autorización, recursos inexistentes y errores internos.
- Se impide consultar públicamente productos inactivos y se devuelve un `409` descriptivo si se intenta borrar un producto referenciado por órdenes.
- Se añadieron pruebas de funcionalidad para registro, catálogo, autorización, creación de órdenes y propiedad de órdenes.
- Se reemplazó el README genérico por instrucciones de instalación, configuración, endpoints y flujo de pago.
- Se añadió `config/cors.php` con orígenes permitidos para el frontend Next.js (`http://localhost:3000`, `http://127.0.0.1:3000`) y métodos/headers estándar.
- Se incorporó el frontend Next.js 16 en `frontend/` (catálogo, autenticación con cookie httpOnly, carrito, órdenes, pago con Stripe Elements, historial) con evidencia Lighthouse en `frontend/docs/lighthouse/`.

## Validaciones realizadas en este entorno

- Se ejecutó `php -l` sobre los archivos PHP del proyecto: no se encontraron errores de sintaxis.
- Se comprobó que `storage/api-docs/api-docs.json` es JSON válido y contiene las rutas documentadas de registro, login, productos, órdenes y pagos.

## Pendiente de ejecutar localmente

No se pudo ejecutar la suite PHPUnit ni generar Swagger desde Artisan en este entorno porque el ZIP no incluye `vendor/` y Composer no está instalado en el entorno de revisión. Después de instalar dependencias, ejecuta:

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configura MySQL y Stripe en .env
php artisan migrate:fresh --seed
php artisan l5-swagger:generate
php artisan test
php artisan serve
```

**Precaución:** `migrate:fresh` elimina todas las tablas de la base de datos configurada. Úsalo solo con una base local desechable. Para pagos usa claves de prueba de Stripe y configura el webhook con el secreto `whsec_...` correcto.

## Limitaciones conocidas / mejoras recomendadas

- El endpoint de gestión de productos requiere autenticación, tal como solicita el enunciado, pero no existe un rol `admin`; por tanto, cualquier usuario autenticado puede administrar productos. Si se necesita una tienda real, conviene añadir autorización por rol/policy.
- El stock se descuenta al crear la orden. Para una solución de producción se recomienda implementar expiración de órdenes pendientes y liberar reservas cuando el pago no se completa.
- El pago debe confirmarse en el cliente con Stripe.js/SDK usando `client_secret`; la API no recibe ni almacena números de tarjeta.
- El JSON Swagger incluido se actualizó para que no omita las rutas de pago, pero se recomienda regenerarlo con `php artisan l5-swagger:generate` tras `composer install`.
