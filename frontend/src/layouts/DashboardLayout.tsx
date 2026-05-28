import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthLogo } from "@/features/auth";
import { IconClipboard, IconSearch, IconTicket } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import { usePanelTheme } from "@/context/PanelThemeContext";
import { etiquetaRol, normalizarRol, type RolUsuario } from "@/lib/roles";

const navCls = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? " active" : ""}`;

export default function DashboardLayout() {
  const { user, logout, syncUserFromServer } = useAuth();
  const { mode, setMode } = usePanelTheme();
  const navigate = useNavigate();
  const rol: RolUsuario = user ? normalizarRol(user.rol) : "usuario";
  const [syncPw, setSyncPw] = useState("");
  const [syncFb, setSyncFb] = useState<string | null>(null);
  const [syncOk, setSyncOk] = useState(false);
  const [syncLoad, setSyncLoad] = useState(false);

  useEffect(() => {
    void import("../styles/dashboard.css");
  }, []);

  return (
    <div
      className={`panel-theme app-shell${mode === "light" ? " panel-theme--light" : ""}`}
    >
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <AuthLogo />
          </div>
          <p className="brand-tagline">Centro de soporte</p>
        </div>

        {user && (
          <div className="sidebar-user" style={{ padding: "0 0.35rem" }}>
            <p className="hint" style={{ margin: "0 0 0.5rem", fontSize: "0.8rem" }}>
              {user.email}
            </p>
            <p
              className="sidebar-role"
              style={{
                margin: "0 0 0.65rem",
                fontSize: "0.8rem",
                color: "var(--text)",
              }}
            >
              <span className="badge ok" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                {etiquetaRol(user.rol)}
              </span>
            </p>
            <button
              type="button"
              className="btn secondary"
              style={{ width: "100%", fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              Cerrar sesión
            </button>
            <details style={{ marginTop: "0.65rem", fontSize: "0.75rem" }}>
              <summary className="hint" style={{ cursor: "pointer", userSelect: "none" }}>
                Actualizar permisos
              </summary>
              <p className="hint" style={{ margin: "0.5rem 0 0.35rem", lineHeight: 1.4 }}>
                Si te cambiaron el perfil, actualiza aquí para refrescar tu acceso actual.
              </p>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Contraseña"
                value={syncPw}
                onChange={(e) => setSyncPw(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: "0.35rem",
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--border, #333)",
                  background: "var(--surface, #1a1a1a)",
                  color: "inherit",
                }}
              />
              <button
                type="button"
                className="btn secondary"
                style={{ width: "100%", fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                disabled={syncLoad}
                onClick={() => {
                  void (async () => {
                    setSyncFb(null);
                    setSyncOk(false);
                    setSyncLoad(true);
                    const r = await syncUserFromServer(syncPw);
                    setSyncLoad(false);
                    if (r.ok) {
                      setSyncPw("");
                      setSyncOk(true);
                      setSyncFb("Perfil actualizado. El menú refleja el rol actual.");
                    } else {
                      setSyncOk(false);
                      setSyncFb(r.message);
                    }
                  })();
                }}
              >
                {syncLoad ? "Comprobando…" : "Sincronizar sesión"}
              </button>
              {syncFb && (
                <p
                  className="hint"
                  style={{
                    margin: "0.35rem 0 0",
                    color: syncOk ? "var(--ok, #6ee7b7)" : "var(--err, #fca5a5)",
                  }}
                  role="status"
                >
                  {syncFb}
                </p>
              )}
            </details>
          </div>
        )}

        <nav aria-label="Principal">
          <div className="nav-section">
            <div className="nav-label">Panel</div>
            <NavLink to="/panel" end className={navCls}>
              <IconTicket size={18} />
              Inicio
            </NavLink>
          </div>

          {rol === "usuario" && (
            <div className="nav-section">
              <div className="nav-label">Atención</div>
              <NavLink to="/panel/nuevo-ticket" end className={navCls}>
                <IconTicket size={18} />
                Crear solicitud
              </NavLink>
              <NavLink to="/panel/mis-tickets" className={navCls}>
                <IconSearch size={18} />
                Mis solicitudes
              </NavLink>
              <NavLink to="/panel/asistente" className={navCls}>
                <IconClipboard size={18} />
                Asistente
              </NavLink>
            </div>
          )}

          {rol === "soporte" && (
            <>
              <div className="nav-section">
                <div className="nav-label">Gestión</div>
                <NavLink to="/consultar" className={navCls}>
                  <IconSearch size={18} />
                  Seguimiento de solicitudes
                </NavLink>
              </div>
              <div className="nav-section">
                <div className="nav-label">Operación</div>
                <NavLink to="/taller/crear" className={navCls}>
                  <IconClipboard size={18} />
                  Crear caso interno
                </NavLink>
                <NavLink to="/taller/filtrar" className={navCls}>
                  <IconSearch size={18} />
                  Filtrar casos
                </NavLink>
                <NavLink to="/taller/metricas" className={navCls}>
                  <IconClipboard size={18} />
                  Resumen
                </NavLink>
              </div>
            </>
          )}

          {rol === "webmaster" && (
            <div className="nav-section">
              <div className="nav-label">Tickets globales</div>
              <NavLink to="/panel/tickets" className={navCls}>
                <IconTicket size={18} />
                Todos los tickets
              </NavLink>
            </div>
          )}

        </nav>

        <footer className="sidebar-footer theme-footer" aria-label="Apariencia del panel">
          <span className="theme-footer-label">Apariencia</span>
          <div className="theme-toggle" role="group" aria-label="Modo claro u oscuro">
            <button
              type="button"
              className={`theme-toggle-btn${mode === "light" ? " is-active" : ""}`}
              onClick={() => setMode("light")}
              aria-pressed={mode === "light"}
            >
              Claro
            </button>
            <button
              type="button"
              className={`theme-toggle-btn${mode === "dark" ? " is-active" : ""}`}
              onClick={() => setMode("dark")}
              aria-pressed={mode === "dark"}
            >
              Oscuro
            </button>
          </div>
        </footer>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
