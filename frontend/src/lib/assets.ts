/**
 * Rutas de assets en `public/` — respetan `import.meta.env.BASE_URL` (Vite / subpath en Azure).
 * Uso: `publicAsset("images/logo.png")` → `/images/logo.png` o `/subpath/images/logo.png`.
 */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${normalized}`;
}
