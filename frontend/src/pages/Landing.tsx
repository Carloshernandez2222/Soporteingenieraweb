import {
  Header,
  Hero,
  PotencialesClientes,
  IdealParaEmpresas,
  CasoExito,
  Estadisticas,
  Footer,
} from "@/components";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Landing() {
  useDocumentTitle("TrackAid");
  return (
    <main>
      <Header />
      <Hero />
      <PotencialesClientes />
      <IdealParaEmpresas />
      <CasoExito />
      <Estadisticas />
      <Footer />
    </main>
  );
}
