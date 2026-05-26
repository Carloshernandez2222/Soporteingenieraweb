import { FLandingSection } from "../layout";

/** Cierre del patrón F: titular + CTA alineados a la izquierda. */
export function CTA() {
  return (
    <FLandingSection variant="band" className="bg-gray-50/50">
      <div className="max-w-3xl text-left">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-850 leading-tight">
          No se trata de vender más, sino de no perder lo que ya vendiste.
        </h2>
        <a
          href="#demo"
          className="inline-block mt-10 px-10 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-dark transition-colors"
        >
          Tener una demo
        </a>
      </div>
    </FLandingSection>
  );
}
