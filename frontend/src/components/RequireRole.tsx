import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { RolUsuario } from "@/lib/roles";
import { normalizarRol } from "@/lib/roles";

type Props = { allow: readonly RolUsuario[] };

/**
 * Debe ir dentro de `RequireAuth`. Si el rol no está permitido, redirige a `/panel`.
 */
export function RequireRole({ allow }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const rol = normalizarRol(user?.rol);
  if (!allow.includes(rol)) {
    return <Navigate to="/panel" replace state={{ forbidden: location.pathname }} />;
  }
  return <Outlet />;
}
