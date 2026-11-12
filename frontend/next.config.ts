import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de caché clásico y estable del App Router:
  // - fetch con next: { tags, revalidate } para datos públicos (catálogo).
  // - revalidateTag()/revalidatePath() tras mutaciones para evitar UI desactualizada.
  // - Rutas con cookies() (sesión) se renderizan en tiempo de request (no-store).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
