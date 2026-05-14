import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/** Rutas con ancla desde la raíz para que funcionen fuera de la landing (p. ej. /registro). */
const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#funcion", label: "Función" },
  { href: "/#producto", label: "Producto" },
  { href: "/#beneficios", label: "Beneficios" },
  { href: "/#precios", label: "Precios" },
] as const;

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20 gap-3 lg:gap-5">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="TrackAid inicio">
            <img
              src="/images/logo.png"
              alt="TrackAid"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
            />
          </Link>

          <nav
            className="hidden lg:flex flex-1 justify-center items-center min-w-0 mx-2 xl:mx-4"
            aria-label="Navegación principal"
          >
            <ul className="flex flex-wrap items-center justify-center gap-x-0.5 xl:gap-x-1 gap-y-1">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex px-2.5 xl:px-3 py-2 rounded-lg text-gray-850 hover:text-primary hover:bg-gray-100/90 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end shrink-0 gap-2 sm:gap-2.5 ml-auto lg:ml-0">
            <Link
              to="/demo"
              className="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-full text-sm font-semibold border-2 border-primary/35 text-primary bg-primary/[0.06] hover:bg-primary/10 hover:border-primary/50 transition-colors"
            >
              Demo
            </Link>
            {user ? (
              <>
                <Link
                  to="/panel"
                  className="inline-flex px-2 sm:px-3 py-2 text-gray-850 hover:text-primary font-medium text-sm transition-colors"
                >
                  Panel
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/", { replace: true });
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 text-gray-850 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/iniciar-sesion"
                  className="hidden sm:inline-flex px-3 py-2 text-gray-850 hover:text-primary font-medium text-sm transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary-dark transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
