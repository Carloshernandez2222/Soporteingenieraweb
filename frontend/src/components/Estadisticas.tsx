const STATS = [
  {
    value: "2,245,341",
    label: "Members",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: "46,328",
    label: "Clubs",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    value: "828,867",
    label: "Event Bookings",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: "1,926,436",
    label: "Payments",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

export function Estadisticas() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-850 flex items-center justify-center text-white font-bold text-sm">
                TA
              </div>
              <span className="text-xl font-semibold text-gray-850">TrackAid</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-850">
              Ayudando al Ecommerce
            </h2>
            <p className="mt-6 text-gray-600 max-w-xl">
              El 68% de las cancelaciones en eCommerce no se originan en la
              venta, sino en fallas operativas posteriores como retrasos
              logísticos, errores de integración o falta de seguimiento.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {STATS.map(({ value, label, icon }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <div className="text-primary mb-3">{icon}</div>
                <p className="text-2xl font-bold text-gray-850">{value}</p>
                <p className="text-sm text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
