import { Link } from "react-router-dom";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#servicios", label: "Servicios" },
  { href: "#funcion", label: "Función" },
  { href: "#product", label: "Product" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#precios", label: "Precios" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2" aria-label="TrackAid inicio">
            <img
              src="/images/logo.png"
              alt="TrackAid"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-gray-850 hover:text-primary transition-colors text-sm font-medium"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/iniciar-sesion"
              className="px-4 py-2 text-gray-850 hover:text-primary font-medium text-sm transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
