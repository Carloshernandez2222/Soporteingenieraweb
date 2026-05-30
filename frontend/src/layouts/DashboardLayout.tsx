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
  const { user, logout } = useAuth();
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
    <div className={`panel-theme app-shell${mode === "light" ? " panel-theme--light" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><AuthLogo /></div>
          <p className="brand-tagline">Centro de soporte</p>
        </div>

        {user && (
          <div className="sidebar-user" style={{ padding: "0 0.35rem" }}>
            <p className="hint" style={{ margin: "0 0 0.5rem", fontSize: "0.8rem" }}>
              {user.email}
              {user.companyName ? <><br /><span>{user.companyName}</span></> : null}
            </p>
            <p className="sidebar-role" style={{ margin: "0 0 0.65rem", fontSize: "0.8rem", color: "var(--text)" }}>
              <span className="badge ok" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                {etiquetaRol(user.rol)}
              </span>
            </p>
            <button type="button" className="btn secondary" style={{ width: "100%", fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
              onClick={() => { logout(); navigate("/", { replace: true }); }}>
              Cerrar sesión
            </button>
          </div>
        )}

        <nav aria-label="Principal">
          <div className="nav-section">
            <div className="nav-label">Panel</div>
            <NavLink to="/panel" end className={navCls}>
              <IconTicket size={18} /> Inicio
            </NavLink>
          </div>

          {rol === "usuario" && (
            <div className="nav-section">
              <div className="nav-label">Atención</div>
              <NavLink to="/panel/nuevo-ticket" end className={navCls}>
                <IconTicket size={18} /> Crear solicitud
              </NavLink>
              <NavLink to="/panel/mis-tickets" className={navCls}>
                <IconSearch size={18} /> Mis solicitudes
              </NavLink>
            </div>
          )}

          {rol === "webmaster" && (
            <div className="nav-section">
              <div className="nav-label">Administración</div>
              <NavLink to="/panel/tickets" className={navCls}>
                <IconTicket size={18} /> Todas las solicitudes
              </NavLink>
              <NavLink to="/panel/admin/companias" className={navCls}>
                <IconClipboard size={18} /> Compañías
              </NavLink>
              <NavLink to="/panel/admin/usuarios" className={navCls}>
                <IconClipboard size={18} /> Usuarios
              </NavLink>
            </div>
          )}
        </nav>

        <footer className="sidebar-footer theme-footer" aria-label="Apariencia del panel">
          <span className="theme-footer-label">Apariencia</span>
          <div className="theme-toggle" role="group" aria-label="Modo claro u oscuro">
            <button type="button" className={`theme-toggle-btn${mode === "light" ? " is-active" : ""}`} onClick={() => setMode("light")}>Claro</button>
            <button type="button" className={`theme-toggle-btn${mode === "dark" ? " is-active" : ""}`} onClick={() => setMode("dark")}>Oscuro</button>
          </div>
        </footer>
      </aside>

      <main className="main-area flex-1 w-full overflow-y-auto bg-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}