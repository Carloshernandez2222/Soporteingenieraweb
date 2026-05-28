import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function TerminosCondiciones() {
  useDocumentTitle("Términos y condiciones");

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link to="/registro" className="inline-flex text-sm font-medium text-primary hover:underline">
          Volver al registro
        </Link>

        <article className="mt-4 rounded-3xl border border-primary/15 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <header>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-850">Términos y Condiciones (Borrador)</h1>
            <p className="mt-3 text-gray-600">
              Documento provisional solicitado para validación interna. Esta versión es temporal y será reemplazada por
              la versión legal oficial.
            </p>
          </header>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">1. Uso de la plataforma</h2>
            <p className="mt-2 text-gray-700">
              TrackAid ofrece herramientas para registrar y gestionar solicitudes de soporte. El uso de la plataforma
              debe realizarse con fines operativos y de manera lícita.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">2. Acceso y seguridad</h2>
            <p className="mt-2 text-gray-700">
              Cada cuenta debe mantener su llave de compañía y credenciales de acceso en confidencialidad. El usuario
              es responsable de la actividad realizada con su sesión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">3. Disponibilidad del servicio</h2>
            <p className="mt-2 text-gray-700">
              Se harán esfuerzos razonables para mantener la continuidad del servicio, aunque pueden presentarse
              mantenimientos, interrupciones técnicas o ajustes operativos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">4. Datos y privacidad</h2>
            <p className="mt-2 text-gray-700">
              La información registrada se utiliza para la operación del servicio y mejora de procesos. No se solicita
              públicamente el nombre de la empresa en el registro básico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">5. Cambios de estos términos</h2>
            <p className="mt-2 text-gray-700">
              Este borrador puede modificarse en cualquier momento. Cuando exista versión definitiva, se notificará en
              los canales oficiales de TrackAid.
            </p>
          </section>

          <p className="text-xs text-gray-500">
            Última actualización: borrador interno.
          </p>
        </article>
      </section>
    </main>
  );
}
