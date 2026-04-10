const LOGROS = [
  "Reducir en un 32% las cancelaciones evitables",
  "Disminuir en un 41% los reclamos post-venta",
  "Mejorar en un 27% los tiempos de resolución",
];

export function CasoExito() {
  return (
    <section id="servicios" className="py-16 md:py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center">
              <div className="flex gap-4 p-8">
                <div className="w-24 h-40 bg-white/90 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/30" />
                  <div className="w-12 h-1.5 bg-gray-300 rounded" />
                  <div className="w-8 h-8 rounded bg-primary/20" />
                </div>
                <div className="w-24 h-40 bg-white/90 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/30" />
                  <div className="w-12 h-1.5 bg-gray-300 rounded" />
                  <div className="w-8 h-8 rounded bg-primary/20" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-850 leading-tight">
              De incidencias invisibles a control operativo real
            </h2>
            <p className="mt-6 text-gray-600">
              Una marca de eCommerce en crecimiento enfrentaba cancelaciones
              recurrentes causadas por fallas en integraciones logísticas y
              retrasos no detectados.
            </p>
            <p className="mt-4 text-gray-850 font-medium">
              Tras implementar monitoreo continuo del flujo de pedidos, logró:
            </p>
            <ul className="mt-4 space-y-2">
              {LOGROS.map((item) => (
                <li key={item} className="flex gap-2 text-gray-600">
                  <span className="text-primary font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-gray-600">
              Al obtener visibilidad operativa, transformó el soporte en
              prevención y protegió ingresos ya generados.
            </p>
            <a
              href="#aprende-mas"
              className="inline-block mt-8 px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Aprende más
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
