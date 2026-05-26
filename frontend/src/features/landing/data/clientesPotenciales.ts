import { publicAsset } from "@/lib/assets";

/**
 * Marcas o sectores que confían en TrackAid (carrusel en la landing).
 * Coloca logos en `public/images/clientes/`.
 */
export type ClientePotencial = {
  nombre: string;
  /** Ruta pública resuelta con `publicAsset` */
  logoSrc?: string;
};

export const CLIENTES_POTENCIALES: ClientePotencial[] = [
  { nombre: "Homecenter", logoSrc: publicAsset("images/clientes/homecenter.png") },
  { nombre: "AliExpress", logoSrc: publicAsset("images/clientes/aliexpress.png") },
  { nombre: "Temu", logoSrc: publicAsset("images/clientes/temu.png") },
  { nombre: "Shopify", logoSrc: publicAsset("images/clientes/shopify.png") },
  { nombre: "Amazon", logoSrc: publicAsset("images/clientes/amazon.png") },
  { nombre: "Mercado Libre", logoSrc: publicAsset("images/clientes/mercado-libre.png") },
];
