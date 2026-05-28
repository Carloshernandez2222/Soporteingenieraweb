import { Link } from "react-router-dom";
import { ChatEmbedShell } from "@/components/chat";
import { Footer, Header } from "@/features/landing";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function DemoChatbot() {
  useDocumentTitle("Asistente · TrackAid");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f7f6fb] via-white to-[#f3f1f8]">
      <Header />
      <main className="flex-1 flex flex-col pt-20 md:pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 min-h-0">
          <div className="mb-6 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Asistente en vivo
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-850 tracking-tight">
              Prueba el chat de soporte
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Cuéntanos tu problema con tu correo de contacto y el asistente te ayuda a crear tu caso.
            </p>
            <Link
              to="/"
              className="inline-flex mt-3 text-sm font-medium text-primary hover:underline"
            >
              ← Volver al inicio
            </Link>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <ChatEmbedShell variant="full" showFooter={false} />
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">Demo orientada a usuarios finales.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
