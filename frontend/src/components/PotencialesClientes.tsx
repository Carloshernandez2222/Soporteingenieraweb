import { CLIENTES_POTENCIALES } from "@/data/clientesPotenciales";

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

export function PotencialesClientes() {
  const items = CLIENTES_POTENCIALES;
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <section
      className="py-14 md:py-20 bg-gray-50/50 border-y border-gray-100 overflow-hidden"
      aria-labelledby="potenciales-clientes-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h2 id="potenciales-clientes-heading" className="text-2xl md:text-3xl font-bold text-gray-850">
          Potenciales clientes
        </h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Pensado para operaciones como:</p>
      </div>

      <div className="relative w-full overflow-hidden" aria-hidden>
        {/* Carrusel infinito: dos copias de la lista para el bucle */}
        <div className="flex w-max animate-marquee gap-12 md:gap-16 items-center motion-reduce:animate-none py-2">
          {loop.map((c, i) => (
            <div key={`${c.nombre}-${i}`} className="flex-shrink-0 flex items-center justify-center min-w-[120px]">
              <LogoItem nombre={c.nombre} logoSrc={c.logoSrc} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
