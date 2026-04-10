/**
 * Marcas o sectores que confían en TrackAid (carrusel en la landing).
 * Sustituye por tus datos: si añades `logoSrc`, coloca el archivo en `public/` (p. ej. `public/images/clientes/marca.svg`).
 */
export type ClientePotencial = {
  nombre: string;
  /** Ruta pública, p. ej. `/images/clientes/acme.svg` */
  logoSrc?: string;
};

export const CLIENTES_POTENCIALES: ClientePotencial[] = [
  { nombre: "Homecenter", logoSrc: "/images/clientes/homecenter.png" },
  { nombre: "AliExpress", logoSrc: "/images/clientes/aliexpress.png" },
  { nombre: "Temu", logoSrc: "/images/clientes/temu.png" },
  { nombre: "Shopify", logoSrc: "/images/clientes/shopify.png" },
  { nombre: "Amazon", logoSrc: "/images/clientes/amazon.png" },
  { nombre: "Mercado Libre", logoSrc: "/images/clientes/mercado-libre.png" },
];
