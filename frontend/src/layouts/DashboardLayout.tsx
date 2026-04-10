import { NavLink, Outlet } from "react-router-dom";
import { IconClipboard, IconHealth, IconSearch, IconTicket } from "@/components/Icons";

const navCls = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? " active" : ""}`;

export default function DashboardLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            S
          </div>
          <div className="brand-text">
            <h1>Centro de soporte</h1>
            <p>Incidencias · seguimiento</p>
          </div>
        </div>

        <nav aria-label="Principal">
          <div className="nav-section">
            <div className="nav-label">Público</div>
            <NavLink to="/" className={navCls}>
              TrackAid (landing)
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">Operación</div>
            <NavLink to="/panel/nuevo-ticket" end className={navCls}>
              <IconTicket size={18} />
              Nuevo ticket
            </NavLink>
            <NavLink to="/consultar" className={navCls}>
              <IconSearch size={18} />
              Consultas
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">Laboratorio (memoria)</div>
            <NavLink to="/taller/crear" className={navCls}>
              <IconClipboard size={18} />
              Crear caso
            </NavLink>
            <NavLink to="/taller/lista" className={navCls}>
              <IconClipboard size={18} />
              Listado
            </NavLink>
            <NavLink to="/taller/filtrar" className={navCls}>
              <IconSearch size={18} />
              Por categoría
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">Sistema</div>
            <NavLink to="/salud" className={navCls}>
              <IconHealth size={18} />
              Estado del API
            </NavLink>
            <a className="nav-link" href="/docs" target="_blank" rel="noreferrer">
              <IconClipboard size={18} />
              Documentación OpenAPI
            </a>
          </div>
        </nav>

        <footer className="sidebar-footer">
          Panel interno. En desarrollo, Vite reenvía <code>/registrar</code>, <code>/casos</code> y{" "}
          <code>/api</code> al puerto 8000.
        </footer>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
