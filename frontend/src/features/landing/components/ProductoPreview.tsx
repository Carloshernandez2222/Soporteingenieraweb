import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChatEmbedShell } from "@/components/chat";
import { IconSearch, IconTicket } from "@/components/Icons";
import { publicAsset } from "@/lib/assets";

type PreviewTab = "panel" | "asistente";

function UsuarioPanelEmbed({
  email,
  sidebar,
  children,
}: {
  email: string;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="product-mock-embed rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white select-none"
      aria-hidden
    >
      <div className="panel-theme panel-theme--light app-shell product-mock-shell">
        <aside className="sidebar product-mock-sidebar">
          <div className="brand">
            <div className="brand-logo">
              <span className="inline-flex items-center">
                <img
                  src={publicAsset("images/logo.png")}
                  alt=""
                  width={120}
                  height={36}
                  className="max-h-8 w-auto object-contain"
                />
              </span>
            </div>
            <p className="brand-tagline">Tu espacio de soporte</p>
          </div>
          <div className="sidebar-user embed-sidebar-user">
            <p className="embed-sidebar-label">Conectado como</p>
            <p className="embed-sidebar-email">{email}</p>
            <span className="badge ok embed-user-badge">Usuario</span>
            <span className="btn secondary embed-signout-btn inline-block text-center">Cerrar sesión</span>
          </div>
          <nav className="embed-nav" aria-hidden>
            {sidebar}
          </nav>
          <p className="embed-panel-footnote">Vista de demostración · datos ficticios</p>
        </aside>
        <main className="main-area product-mock-main">{children}</main>
      </div>
    </div>
  );
}

function UsuarioPanelDemo() {
  return (
    <UsuarioPanelEmbed
      email="cliente@ejemplo.com"
      sidebar={
        <>
          <div className="nav-section">
            <div className="nav-label">Menú principal</div>
            <span className="nav-link active">
              <IconTicket size={18} />
              Resumen
            </span>
          </div>
          <div className="nav-section">
            <div className="nav-label">Tus tickets</div>
            <span className="nav-link">
              <IconTicket size={18} />
              Crear ticket
            </span>
            <span className="nav-link">
              <IconSearch size={18} />
              Ver mis tickets
            </span>
          </div>
        </>
      }
    >
      <header className="page-header embed-page-header">
        <div>
          <h1 className="page-title">Resumen</h1>
          <p className="page-subtitle">Desde aquí abres un ticket o revisas lo que ya enviaste.</p>
        </div>
      </header>
      <div className="embed-cards-grid">
        <div className="embed-panel-card">
          <p className="embed-panel-hint">Paso 1</p>
          <p className="embed-card-title">Nueva incidencia</p>
          <p className="embed-card-desc">Formulario guiado con validación.</p>
        </div>
        <div className="embed-panel-card">
          <p className="embed-panel-hint">Paso 2</p>
          <p className="embed-card-title">Seguimiento</p>
          <p className="embed-card-desc">Busca por correo el estado de tus envíos.</p>
        </div>
        <div className="embed-panel-card">
          <p className="embed-panel-hint">Actividad</p>
          <p className="embed-card-title">Historial</p>
          <p className="embed-card-desc">Listado actualizado en tiempo real.</p>
        </div>
      </div>

      <div className="embed-form-section">
        <div className="embed-form-section-head">
          <div className="embed-form-icon" aria-hidden>
            <IconTicket size={22} />
          </div>
          <h2 className="embed-form-section-title">Registrar incidencia</h2>
        </div>

        <div className="embed-form-mock pointer-events-none" aria-hidden>
          <div className="embed-mock-field">
            <span className="embed-mock-label">Solicitante (nombre completo)</span>
            <div className="embed-mock-input">María Gómez López</div>
            <span className="embed-mock-meta">18 / 120</span>
          </div>
          <div className="embed-mock-field">
            <span className="embed-mock-label">Correo de contacto</span>
            <div className="embed-mock-input">maria.gomez@ejemplo.com</div>
            <p className="embed-mock-hint">Se usará para localizar tus tickets posteriores.</p>
          </div>
          <div className="embed-mock-field">
            <span className="embed-mock-label">Descripción del problema</span>
            <div className="embed-mock-textarea">
              El pedido #4582 aparece como entregado pero el cliente no recibió el paquete.
            </div>
            <span className="embed-mock-meta">142 / 4000</span>
          </div>
          <span className="embed-mock-submit">Enviar solicitud</span>
        </div>
      </div>
    </UsuarioPanelEmbed>
  );
}

export function ProductoPreview() {
  const [tab, setTab] = useState<PreviewTab>("panel");

  useEffect(() => {
    void import("@/styles/dashboard.css");
  }, []);

  return (
    <section
      id="producto"
      className="relative z-0 isolate py-16 md:py-24 bg-gray-50/80 scroll-mt-24 md:scroll-mt-28"
      aria-labelledby="producto-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 md:mb-10">
          <h2 id="producto-heading" className="text-2xl md:text-3xl font-bold text-gray-850 tracking-tight">
            Así se ve TrackAid en uso
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Explora el <strong>panel de usuario</strong> o prueba el <strong>asistente</strong> en vivo.
            Al{" "}
            <Link to="/registro" className="text-primary font-medium hover:underline">
              crear cuenta
            </Link>{" "}
            accedes con tus datos reales.
          </p>
        </div>

        <div className="product-preview-tabs lg:hidden" role="tablist" aria-label="Vista del producto">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "panel"}
            className={`product-preview-tab ${tab === "panel" ? "product-preview-tab--active" : ""}`}
            onClick={() => setTab("panel")}
          >
            Panel de usuario
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "asistente"}
            className={`product-preview-tab ${tab === "asistente" ? "product-preview-tab--active" : ""}`}
            onClick={() => setTab("asistente")}
          >
            Asistente (interactivo)
          </button>
        </div>

        <div className="hidden lg:grid product-preview-dual">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Panel web</p>
            <UsuarioPanelDemo />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Asistente · puedes escribir aquí
            </p>
            <ChatEmbedShell variant="compact" showFooter={false} subtitle="Demo en vivo" />
          </div>
        </div>

        <div className="min-w-0 lg:hidden" role="tabpanel">
          {tab === "panel" ? (
            <UsuarioPanelDemo />
          ) : (
            <div className="max-w-lg mx-auto">
              <ChatEmbedShell variant="compact" subtitle="Prueba aquí · Registro real" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
