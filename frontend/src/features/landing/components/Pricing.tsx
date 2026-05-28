import { useState } from "react";
import { Link } from "react-router-dom";

type BillingMode = "mensual" | "anual";

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
    monthlyPrice: 49,
    yearlyMonthlyPrice: 41,
    priceNote: "Facturación flexible según tamaño del equipo.",
    features: [
      "Roles (usuario, soporte, webmaster)",
      "Taller de casos e historial centralizado",
      "Priorización y categorías",
      "Escalable cuando creces el equipo",
    ],
    cta: { label: "Ver detalle del plan", to: "/planes/startups" as const },
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
    cta: { label: "Hablar por WhatsApp", to: "/registro" as const },
    highlighted: false,
  },
] as const;

export function Pricing() {
  const [billing, setBilling] = useState<BillingMode>("mensual");

  const buildPlanLink = (planId: string) => {
    if (planId === "startups") {
      return `/planes/startups?cobro=${billing}`;
    }
    return `/registro?plan=${planId}&cobro=${billing}`;
  };

  const whatsappHref =
    "https://wa.me/573001234567?text=Hola%20TrackAid%2C%20quiero%20informaci%C3%B3n%20del%20plan%20para%20organizaciones%20grandes.";

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

          <div className="mt-6 inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBilling("mensual")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                billing === "mensual" ? "bg-primary text-white" : "text-gray-600 hover:text-gray-850"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBilling("anual")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                billing === "anual" ? "bg-primary text-white" : "text-gray-600 hover:text-gray-850"
              }`}
            >
              Anual
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  billing === "anual" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                -16%
              </span>
            </button>
          </div>
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
                {"monthlyPrice" in plan ? (
                  <>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-850">
                      Desde ${billing === "anual" ? plan.yearlyMonthlyPrice : plan.monthlyPrice}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      / mes · {billing === "anual" ? "cobro anual" : "cobro mensual"} · {plan.priceNote}
                    </p>
                    {billing === "anual" ? (
                      <p className="mt-1 text-xs font-semibold text-primary">
                        Ahorras ${plan.monthlyPrice - plan.yearlyMonthlyPrice} por mes por equipo.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-850">{plan.price}</p>
                    <p className="mt-1 text-sm text-gray-500">{plan.priceNote}</p>
                  </>
                )}
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
                {plan.id === "enterprise" ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center rounded-full py-3.5 px-6 font-semibold transition-colors bg-gray-100 text-gray-850 hover:bg-gray-200"
                  >
                    {plan.cta.label}
                  </a>
                ) : (
                  <Link
                    to={buildPlanLink(plan.id)}
                    className={`block w-full text-center rounded-full py-3.5 px-6 font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-primary text-white hover:bg-primary-dark"
                        : "bg-gray-100 text-gray-850 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta.label}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700">
            Activación rápida y sin bloqueos.
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700">
            Puedes cambiar de plan cuando lo necesites.
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700">
            Te recomendamos plan según tu volumen real.
          </div>
        </div>
      </div>
    </section>
  );
}
