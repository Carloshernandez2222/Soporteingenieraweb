import {
  Header,
  Hero,
  PotencialesClientes,
  IdealParaEmpresas,
  CasoExito,
  ProductoPreview,
  Pricing,
  Estadisticas,
  Footer,
} from "@/features/landing";
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
      <ProductoPreview />
      <Pricing />
      <Estadisticas />
      <Footer />
    </main>
  );
}
