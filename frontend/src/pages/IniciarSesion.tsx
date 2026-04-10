import { LoginForm, SignUpVisualPanel } from "@/components/auth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function IniciarSesion() {
  useDocumentTitle("Iniciar sesión - TrackAid");
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <section
        className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16 bg-white"
        aria-label="Formulario de inicio de sesión"
      >
        <LoginForm />
      </section>
      <section className="hidden lg:block lg:w-[55%] xl:w-[58%]" aria-hidden>
        <SignUpVisualPanel />
      </section>
    </div>
  );
}
