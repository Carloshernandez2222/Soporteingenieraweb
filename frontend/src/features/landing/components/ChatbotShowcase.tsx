import { Link } from "react-router-dom";
import { ChatEmbedShell } from "@/components/chat";
import { FLandingSection, FPatternRow } from "../layout";

/** Sección landing: asistente embebido e interactivo (patrón F). */
export function ChatbotShowcase() {
  return (
    <FLandingSection id="asistente" variant="default" className="bg-white scroll-mt-24 md:scroll-mt-28">
      <FPatternRow
        visual={
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <ChatEmbedShell variant="compact" />
          </div>
        }
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          Asistente inteligente
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-850 tracking-tight">
          Soporte conversacional que registra incidencias de verdad
        </h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Tus clientes o operadores describen el problema en lenguaje natural. Si el mensaje incluye un{" "}
          <strong>correo</strong>, el backend crea un ticket en la base (patrón Strategy + Observer en la
          API).
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-primary font-bold">1.</span>
            Escribe o elige una sugerencia rápida en el chat de la derecha.
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">2.</span>
            Usa «Registrar ejemplo» para ver un ticket de prueba al instante.
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">3.</span>
            Abre la demo completa para pantalla grande y más espacio.
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors"
          >
            Abrir demo completa
          </Link>
          <a
            href="#producto"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-850 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Ver panel de usuario
          </a>
        </div>
      </FPatternRow>
    </FLandingSection>
  );
}
