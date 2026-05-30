import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function PoliticaPrivacidad() {
  useDocumentTitle("Política de privacidad");

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link to="/registro" className="inline-flex text-sm font-medium text-primary hover:underline">
          Volver al registro
        </Link>

        <article className="mt-4 rounded-3xl border border-primary/15 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <header>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-850">Política de Privacidad (Borrador)</h1>
            <p className="mt-3 text-gray-600">
              Documento provisional solicitado para pruebas. Esta versión no reemplaza una política legal definitiva.
            </p>
          </header>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">1. Datos recopilados</h2>
            <p className="mt-2 text-gray-700">
              Se recopilan datos mínimos para crear la cuenta, autenticar al usuario y gestionar solicitudes de soporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">2. Finalidad</h2>
            <p className="mt-2 text-gray-700">
              Los datos se usan para operación del servicio, trazabilidad de solicitudes y mejora continua del producto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">3. Conservación</h2>
            <p className="mt-2 text-gray-700">
              La información se conserva durante el tiempo necesario para fines operativos, de soporte y cumplimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">4. Seguridad</h2>
            <p className="mt-2 text-gray-700">
              Se aplican medidas técnicas razonables para proteger credenciales y sesiones, incluyendo autenticación por
              token y llaves de compañía.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-850">5. Contacto</h2>
            <p className="mt-2 text-gray-700">
              Para solicitar ajustes o eliminación de información en esta etapa, contactar al equipo administrador.
            </p>
          </section>

          <p className="text-xs text-gray-500">Última actualización: borrador interno.</p>
        </article>
      </section>
    </main>
  );
}
