import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";
import DashboardLayout from "./layouts/DashboardLayout";
import IniciarSesion from "./pages/IniciarSesion";
import DemoChatbot from "./pages/DemoChatbot";
import Landing from "./pages/Landing";
import RegistroCuenta from "./pages/RegistroCuenta";
import Consultar from "./pages/panel/Consultar";
import MisTickets from "./pages/panel/MisTickets";
import NuevoTicket from "./pages/panel/NuevoTicket";
import PanelHome from "./pages/panel/PanelHome";
import Salud from "./pages/panel/Salud";
import TallerCrear from "./pages/panel/TallerCrear";
import TallerFiltrar from "./pages/panel/TallerFiltrar";
import TallerIntegracion from "./pages/panel/TallerIntegracion";
import TallerLista from "./pages/panel/TallerLista";
import TallerMetricas from "./pages/panel/TallerMetricas";
import TicketsGenerales from "./pages/panel/TicketsGenerales";

/** Contenedor visual común de la zona pública (solo Tailwind). */
function PublicChrome() {
  return (
    <div className="trackaid-public min-h-screen antialiased bg-white text-gray-850">
      <Outlet />
    </div>
  );
}

/**
 * Una sola SPA en frontend/: marketing + auth (Tailwind) y panel (CSS cargado en DashboardLayout).
 */
export default function App() {
  return (
    <Routes>
      <Route element={<PublicChrome />}>
        <Route path="/" element={<Landing />} />
        <Route path="/producto" element={<Navigate to="/#producto" replace />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<RegistroCuenta />} />
        <Route path="/demo" element={<DemoChatbot />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/panel" element={<PanelHome />} />

          <Route element={<RequireRole allow={["usuario"]} />}>
            <Route path="/panel/nuevo-ticket" element={<NuevoTicket />} />
          </Route>

          <Route element={<RequireRole allow={["usuario"]} />}>
            <Route path="/panel/mis-tickets" element={<MisTickets />} />
          </Route>

          <Route element={<RequireRole allow={["soporte"]} />}>
            <Route path="/consultar" element={<Consultar />} />
            <Route path="/taller/crear" element={<TallerCrear />} />
          </Route>

          <Route element={<RequireRole allow={["soporte"]} />}>
            <Route path="/taller/lista" element={<TallerLista />} />
            <Route path="/taller/filtrar" element={<TallerFiltrar />} />
            <Route path="/taller/integracion" element={<TallerIntegracion />} />
            <Route path="/taller/metricas" element={<TallerMetricas />} />
          </Route>

          <Route element={<RequireRole allow={["webmaster"]} />}>
            <Route path="/panel/tickets" element={<TicketsGenerales />} />
            <Route path="/salud" element={<Salud />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
