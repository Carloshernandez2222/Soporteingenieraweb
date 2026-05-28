import { Link, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function PlanStartups() {
  useDocumentTitle("Plan Startups y empresas - TrackAid");
  const [searchParams] = useSearchParams();
  const billing = searchParams.get("cobro") === "anual" ? "anual" : "mensual";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link to="/#precios" className="inline-flex text-sm font-medium text-primary hover:underline">
          Volver a planes
        </Link>

        <div className="mt-4 rounded-3xl border border-primary/20 bg-white p-6 sm:p-8 shadow-sm">
          <p className="inline-flex rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
            Plan más elegido
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-850">Startups y empresas</h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg max-w-2xl">
            Diseñado para equipos que ya venden y necesitan ordenar su operación de soporte con
            trazabilidad y roles claros.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
            <p className="text-sm text-gray-600">Modalidad seleccionada</p>
            <p className="mt-1 text-xl font-bold text-gray-850">
              {billing === "anual" ? "Desde $41 / mes (cobro anual)" : "Desde $49 / mes (cobro mensual)"}
            </p>
            {billing === "anual" ? (
              <p className="mt-1 text-sm font-semibold text-primary">Ahorro del 16% por compromiso anual.</p>
            ) : null}
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-850">Incluye</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Roles por equipo para ordenar responsabilidades.</li>
                <li>Historial centralizado para seguimiento continuo.</li>
                <li>Priorización de incidencias por impacto.</li>
                <li>Base preparada para crecer sin fricción.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-850">Ideal si hoy tienes</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Más de una persona atendiendo soporte.</li>
                <li>Pedidos con incidencias repetitivas.</li>
                <li>Necesidad de visibilidad para decisiones.</li>
                <li>Objetivo de reducir tiempos y reclamos.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/registro?plan=startups&cobro=${billing}`}
              className="inline-flex items-center justify-center rounded-full bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-dark transition-colors"
            >
              Continuar con este plan
            </Link>
            <a
              href="https://wa.me/573001234567?text=Hola%20TrackAid%2C%20quiero%20una%20asesor%C3%ADa%20del%20plan%20Startups%20y%20empresas."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-800 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
            >
              Resolver dudas por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
