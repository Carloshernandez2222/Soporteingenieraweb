import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section
      id="home"
      className="pt-28 pb-16 md:pt-36 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-850 leading-tight">
            Controla la continuidad de tu{" "}
            <span className="text-primary">operación logística</span>
          </h1>
          <p className="mt-6 text-gray-600 text-lg max-w-xl">
            TrackAid monitorea y gestiona incidencias en el flujo de pedidos para
            evitar errores, retrasos y cancelaciones.
          </p>
          <Link
            to="/registro"
            className="inline-block mt-8 px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Registrarse
          </Link>
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md aspect-square">
            <img
              src="/images/hero-illustration.png"
              alt=""
              width={500}
              height={500}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
