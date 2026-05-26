import { Link } from "react-router-dom";

import { publicAsset } from "@/lib/assets";
import { FLandingSection, FPatternRow } from "../layout";

export function Hero() {
  return (
    <FLandingSection id="home" variant="hero">
      <FPatternRow
        visual={
          <div className="relative w-full max-w-md aspect-square">
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
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-850 leading-tight">
          Controla la continuidad de tu{" "}
          <span className="text-primary">operación logística</span>
        </h1>
        <p className="mt-6 text-gray-600 text-lg max-w-xl">
          TrackAid monitorea y gestiona incidencias en el flujo de pedidos para evitar errores,
          retrasos y cancelaciones.
        </p>
        <Link
          to="/registro"
          className="inline-block mt-8 px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          Registrarse
        </Link>
      </FPatternRow>
    </FLandingSection>
  );
}
