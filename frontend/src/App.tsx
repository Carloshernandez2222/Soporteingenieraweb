import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Consultar from "./pages/Consultar";
import Registro from "./pages/Registro";
import Salud from "./pages/Salud";
import TallerCrear from "./pages/TallerCrear";
import TallerFiltrar from "./pages/TallerFiltrar";
import TallerLista from "./pages/TallerLista";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Registro />} />
        <Route path="/consultar" element={<Consultar />} />
        <Route path="/taller/crear" element={<TallerCrear />} />
        <Route path="/taller/lista" element={<TallerLista />} />
        <Route path="/taller/filtrar" element={<TallerFiltrar />} />
        <Route path="/salud" element={<Salud />} />
      </Route>
    </Routes>
  );
}
