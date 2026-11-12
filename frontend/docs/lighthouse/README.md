# Evidencia de rendimiento — Lighthouse / Web Vitals

Frontend Next.js (producción: `next build` + `next start`) sirviéndose en
`http://127.0.0.1:3000`, con la API Laravel en `http://127.0.0.1:8000`.

Herramienta: **Lighthouse 12** (CLI, Chrome headless), categorías
Performance / Accessibility / Best Practices / SEO, perfil móvil por defecto.

Archivos de evidencia:

- `lighthouse-home.json` — página de inicio `/`
- `lighthouse-products.json` — catálogo `/products` (ruta clave con streaming + Suspense)

## Resumen de resultados

| Métrica | `/` (home) | `/products` (catálogo) | Umbral "Good" |
|---|---|---|---|
| **Performance** | **98 / 100** | **97 / 100** | ≥ 90 |
| Accessibility | 100 / 100 | 100 / 100 | ≥ 90 |
| Best Practices | 100 / 100 | 100 / 100 | ≥ 90 |
| SEO | 100 / 100 | 100 / 100 | ≥ 90 |
| FCP (First Contentful Paint) | 0.8 s | 0.8 s | ≤ 1.8 s |
| **LCP (Largest Contentful Paint)** | **0.8 s** | **0.8 s** | ≤ 2.5 s |
| **TBT (Total Blocking Time)** | 170 ms | 180 ms | ≤ 200 ms |
| **CLS (Cumulative Layout Shift)** | **0** | **0.044** | ≤ 0.1 |
| Speed Index | 0.8 s | 0.8 s | ≤ 3.4 s |
| TTFB (server-response-time) | 20 ms | 30 ms | ≤ 800 ms |

## Técnicas aplicadas para lograr estos números

1. **Server Components por defecto**: catálogo, ficha de producto, historial y
   detalle de orden se renderizan en servidor; el cliente solo recibe los
   componentes interactivos mínimos (carrito, formularios, Stripe).
2. **Streaming con `<Suspense>`**: el shell del catálogo viaja de inmediato y
   la lista pesada llega por streaming (`product-list.tsx` dentro de
   `Suspense` con esqueleto `GridSkeleton`). Ídem historial (`order-list.tsx`).
3. **`loading.tsx` en rutas clave** (`/products`, `/checkout`): skeletons
   instantáneos durante la navegación (ubicados en route groups para no
   interferir con los 404 de las subrutas).
4. **Fuentes del sistema** en vez de Google Fonts: cero requests externos,
   cero FOIT/CLS por descarga de fuentes.
5. **Caché de datos públicos con tags**: `fetch` del catálogo con
   `next: { tags: ['products'], revalidate: 60 }` → TTFB mínimo y datos
   frescos garantizados tras cada mutación (`revalidateTag('products', { expire: 0 })`).
6. **Imágenes placeholder sin descarga**: los productos usan gradientes CSS
   (sin assets pesados en este proyecto de demostración).
7. **Página de inicio estática** (`/`): prerender en build, LCP inmediato.
8. **HTML mínimo + JS de hidratación reducido**: la mayor parte del marcado
   no requiere JavaScript del cliente para mostrarse.

## Reproducción

```bash
# 1) API Laravel
php artisan serve                      # http://127.0.0.1:8000

# 2) Frontend en modo producción
npm run build
npm run start                          # http://127.0.0.1:3000

# 3) Lighthouse
npx lighthouse http://127.0.0.1:3000 \
  --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=lighthouse-home.json
npx lighthouse http://127.0.0.1:3000/products \
  --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=lighthouse-products.json
```

> Nota: las métricas corresponden a un entorno local de desarrollo con la API
> y el frontend en la misma máquina. El CLS de 0.044 en el catálogo proviene
> del reemplazo del esqueleto por la lista real durante el streaming; sigue
> dentro del umbral "Good" (< 0.1).
