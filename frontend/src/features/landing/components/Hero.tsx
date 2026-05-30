import { Link } from "react-router-dom";

import { publicAsset } from "@/lib/assets";
import { FLandingSection, FPatternRow } from "../layout";

export function Hero() {
  return (
    <FLandingSection id="home" variant="hero">
      <FPatternRow
        visual={
          <div className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-md aspect-square mx-auto lg:mx-0">
            <img
              src={publicAsset("images/hero-illustration.png")}
              alt=""
              width={500}
              height={500}
              className="w-full h-auto object-contain"
            />
          </div>
        }
      >
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-850 leading-tight max-w-[20ch]">
          Controla la continuidad de tu{" "}
          <span className="text-primary">operación logística</span>
        </h1>
        <p className="mt-5 sm:mt-6 text-gray-600 text-base sm:text-lg max-w-xl">
          TrackAid monitorea y gestiona incidencias en el flujo de pedidos para evitar errores,
          retrasos y cancelaciones.
        </p>
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto max-w-md">
          <Link
            to="/registro"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors w-full sm:w-auto"
          >
            Registrarse
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-primary/30 text-primary rounded-full font-semibold hover:bg-primary/5 transition-colors w-full sm:w-auto"
          >
            Probar asistente
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          También puedes chatear en la sección{" "}
          <a href="#asistente" className="text-primary font-medium hover:underline">
            Asistente inteligente
          </a>
          .
        </p>
      </FPatternRow>
    </FLandingSection>
  );
}
