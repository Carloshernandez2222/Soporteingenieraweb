import { CLIENTES_POTENCIALES } from "../data/clientesPotenciales";
import { FLandingSection } from "../layout";

function LogoItem({ nombre, logoSrc }: { nombre: string; logoSrc?: string }) {
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={nombre}
        className="h-9 md:h-11 w-auto max-w-[min(160px,28vw)] object-contain opacity-[0.95] hover:opacity-100 transition-opacity"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 whitespace-nowrap">
      {nombre}
    </span>
  );
}

/** Banda horizontal del patrón F: logos en carrusel infinito. */
export function PotencialesClientes() {
  const items = CLIENTES_POTENCIALES;
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <FLandingSection
      variant="band"
      className="bg-gray-50/50 overflow-hidden"
      ariaLabelledBy="potenciales-clientes-heading"
    >
      <div className="text-left mb-10 max-w-2xl">
        <h2 id="potenciales-clientes-heading" className="text-2xl md:text-3xl font-bold text-gray-850">
          Potenciales clientes
        </h2>
        <p className="mt-3 text-gray-600">Pensado para operaciones como:</p>
      </div>

      <div className="relative w-full overflow-hidden sm:-mx-6 lg:-mx-8" aria-hidden>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-gray-50/95 to-transparent z-10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-gray-50/95 to-transparent z-10"
          aria-hidden
        />
        <div className="flex w-max animate-marquee gap-12 md:gap-16 items-center motion-reduce:animate-none py-2 px-4 sm:px-6 lg:px-8">
          {loop.map((c, i) => (
            <div
              key={`${c.nombre}-${i}`}
              className="flex-shrink-0 flex items-center justify-center min-w-[120px]"
            >
              <LogoItem nombre={c.nombre} logoSrc={c.logoSrc} />
            </div>
          ))}
        </div>
      </div>
    </FLandingSection>
  );
}
