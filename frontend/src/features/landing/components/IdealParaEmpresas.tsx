import { FLandingSection } from "../layout";

const CARDS = [
  {
    title: "Por nivel de operación",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    items: [
      "eCommerce en crecimiento",
      "Empresas con alto volumen de pedidos",
      "Operaciones con múltiples integraciones",
      "Marcas con logística tercerizada",
    ],
  },
  {
    title: "Por problema que tienen",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    items: [
      "Empresas con cancelaciones frecuentes",
      "Negocios con reclamos post-venta",
      "Equipos sin visibilidad logística",
      "Operaciones con fallas en integraciones",
    ],
  },
  {
    title: "Por estructura",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    items: [
      "Tiendas D2C",
      "Marketplaces",
      "Retail omnicanal",
      "Empresas con ERP",
    ],
  },
  {
    title: "Por etapa",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    items: [
      "Empresas que están escalando",
      "Equipos que ya venden pero pierden control",
      "Negocios que buscan reducir reclamos",
      "Operaciones que quieren proteger ingresos",
    ],
  },
];

export function IdealParaEmpresas() {
  return (
    <FLandingSection id="beneficios">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-850 text-left max-w-2xl">
        Ideal para empresas que:
      </h2>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map(({ title, icon, items }) => (
          <article
            key={title}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-primary mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-850 mb-4">{title}</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              {items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </FLandingSection>
  );
}
