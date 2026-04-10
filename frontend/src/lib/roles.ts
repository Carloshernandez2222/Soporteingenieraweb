/** Roles alineados con el backend (`src/constants.py`). */

export const ROLES_USUARIO = ["webmaster", "soporte", "usuario"] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];

export const ROL_DEFECTO: RolUsuario = "usuario";

export const ETIQUETA_ROL: Record<RolUsuario, string> = {
  webmaster: "Webmaster",
  soporte: "Soporte",
  usuario: "Usuario",
};

export function esRolValido(s: string | undefined): s is RolUsuario {
  return ROLES_USUARIO.includes(s as RolUsuario);
}

export function normalizarRol(s: string | undefined): RolUsuario {
  const t = (s ?? "").trim().toLowerCase();
  return esRolValido(t) ? t : ROL_DEFECTO;
}

/** Texto legible para UI (API/localStorage pueden omitir o malformar `rol`). */
export function etiquetaRol(s: string | undefined): string {
  return ETIQUETA_ROL[normalizarRol(s)];
}
