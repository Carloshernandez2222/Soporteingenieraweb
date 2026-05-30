import { normalizarRol } from "@/lib/roles";

/** Solo el webmaster ve rutas HTTP y detalle técnico de endpoints en el panel. */
export function mostrarDetalleApi(rol: string | undefined): boolean {
  void normalizarRol(rol);
  return false;
}
