import { Link } from "react-router-dom";

const PLANS = [
  {
    id: "personas",
    badge: "Para empezar",
    title: "Personas",
    subtitle: "Freelancers, creadores o un solo canal de ventas.",
    price: "Gratis",
    priceNote: "Hasta un volumen moderado de tickets.",
    features: [
      "Registro y seguimiento de tickets",
      "Historial por correo",
      "Panel claro y sencillo",
      "Ideal si gestionas todo tú solo/a",
    ],
    cta: { label: "Crear cuenta", to: "/registro" as const },
    highlighted: false,
  },
  {
    id: "startups",
    badge: "Más popular",
    title: "Startups y empresas",
    subtitle: "Equipos que ya facturan y necesitan orden en soporte.",
    price: "Desde $49",
    priceNote: "/ mes · facturación flexible según tamaño del equipo.",
    features: [
      "Roles (usuario, soporte, webmaster)",
      "Taller de casos e historial centralizado",
      "Priorización y categorías",
      "Escalable cuando creces el equipo",
    ],
    cta: { label: "Comenzar prueba", to: "/registro" as const },
    highlighted: true,
  },
  {
    id: "enterprise",
    badge: "A medida",
    title: "Organizaciones grandes",
    subtitle: "Alto volumen, integraciones o requisitos especiales.",
    price: "Hablemos",
    priceNote: "Propuesta según volumen, SLA y necesidades.",
    features: [
      "Volumen y canales a escala",
      "Acompañamiento en despliegue",
      "Opciones de integración y gobierno de datos",
      "Contrato y facturación corporativa",
    ],
    cta: {
      label: "Contactar al equipo",
      href: "mailto:hola@trackaid.com?subject=Consulta%20TrackAid%20-%20plan%20empresarial",
    },
    highlighted: false,
  },
] as const;

export function Pricing() {
  return (
    <section id="precios" className="py-16 md:py-24 bg-gray-50/80 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">Planes</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-850">
            Precios claros según tu etapa
          </h2>
          <p className="mt-3 text-gray-600">
            Desde quien arranca solo hasta equipos que necesitan un trato dedicado. Si ya eres muy grande,
            mejor lo vemos juntos.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-shadow ${
                plan.highlighted
                  ? "border-primary ring-2 ring-primary/20 shadow-md md:scale-[1.02] z-10"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <span
                className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${
                  plan.highlighted ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
                }`}
              >
                {plan.badge}
              </span>
              <h3 className="mt-4 text-xl font-bold text-gray-850">{plan.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{plan.subtitle}</p>
              <div className="mt-6">
                <p className="text-3xl sm:text-4xl font-bold text-gray-850">{plan.price}</p>
                <p className="mt-1 text-sm text-gray-500">{plan.priceNote}</p>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary shrink-0 mt-0.5" aria-hidden>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {"to" in plan.cta ? (
                  <Link
                    to={plan.cta.to}
                    className={`block w-full text-center rounded-full py-3.5 px-6 font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-primary text-white hover:bg-primary-dark"
                        : "bg-gray-100 text-gray-850 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta.label}
                  </Link>
                ) : (
                  <a
                    href={plan.cta.href}
                    className="block w-full text-center rounded-full py-3.5 px-6 font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {plan.cta.label}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500 max-w-xl mx-auto">
          Los importes son orientativos; el plan empresarial se ajusta a tu caso. ¿Dudas?{" "}
          <a href="mailto:hola@trackaid.com" className="text-primary font-medium hover:underline">
            Escríbenos
          </a>
          .
        </p>
      </div>
    </section>
  );
}
