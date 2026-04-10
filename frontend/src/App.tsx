import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import Landing from "./pages/Landing";
import IniciarSesion from "./pages/IniciarSesion";
import RegistroCuenta from "./pages/RegistroCuenta";
import Consultar from "./pages/dashboard/Consultar";
import NuevoTicket from "./pages/dashboard/NuevoTicket";
import Salud from "./pages/dashboard/Salud";
import TallerCrear from "./pages/dashboard/TallerCrear";
import TallerFiltrar from "./pages/dashboard/TallerFiltrar";
import TallerLista from "./pages/dashboard/TallerLista";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro" element={<RegistroCuenta />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/panel/nuevo-ticket" element={<NuevoTicket />} />
        <Route path="/consultar" element={<Consultar />} />
        <Route path="/taller/crear" element={<TallerCrear />} />
        <Route path="/taller/lista" element={<TallerLista />} />
        <Route path="/taller/filtrar" element={<TallerFiltrar />} />
        <Route path="/salud" element={<Salud />} />
      </Route>
    </Routes>
  );
}
