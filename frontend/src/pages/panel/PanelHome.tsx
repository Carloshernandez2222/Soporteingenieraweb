import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  IconClipboard,
  IconHealth,
  IconSearch,
  IconTicket,
} from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { normalizarRol, type RolUsuario } from "@/lib/roles";

type Card = {
  to: string;
  title: string;
  /** Texto para usuario/soporte (sin métodos HTTP). */
  desc: string;
  /** Solo se muestra entre paréntesis si el rol es webmaster. */
  apiLine?: string;
  icon: ReactNode;
  external?: boolean;
  roles: readonly RolUsuario[];
};

const allCards: Card[] = [
  {
    to: "/panel/nuevo-ticket",
    title: "Nuevo ticket",
    desc: "Registrar una incidencia; queda guardada en la base de datos.",
    apiLine: "POST /registrar?origen=web",
    icon: <IconTicket size={22} />,
    roles: ["usuario"],
  },
  {
    to: "/panel/mis-tickets",
    title: "Buscar mis tickets",
    desc: "Por el mismo correo y nombre con los que registró la incidencia.",
    apiLine: "GET /api/casos/soporte/mis-tickets/{user_id}",
    icon: <IconSearch size={22} />,
    roles: ["usuario"],
  },
  {
    to: "/consultar",
    title: "Consultas y seguimiento",
    desc: "Casos del taller, historial por correo y detalle por número de ticket.",
    icon: <IconSearch size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/panel/tickets",
    title: "Todos los tickets",
    desc: "Vista global de los casos del taller creados por soporte.",
    apiLine: "GET /api/casos/taller + /api/casos/registro/tickets",
    icon: <IconTicket size={22} />,
    roles: ["webmaster"],
  },
  {
    to: "/taller/crear",
    title: "Crear caso (taller)",
    desc: "Alta de un caso interno en la base de datos del taller.",
    apiLine: "POST /api/casos/taller",
    icon: <IconClipboard size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/taller/lista",
    title: "Listado del taller",
    desc: "Vista de todos los casos del taller guardados.",
    apiLine: "GET /api/casos/taller",
    icon: <IconClipboard size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/taller/filtrar",
    title: "Por categoría",
    desc: "Filtrar casos del taller por categoría.",
    apiLine: "GET /api/casos/taller/filtrar",
    icon: <IconSearch size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/taller/integracion",
    title: "Integración e-commerce",
    desc: "Adapter: importar casos desde payloads Amazon o Shopify.",
    apiLine: "POST /api/casos/taller/integracion",
    icon: <IconClipboard size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/taller/metricas",
    title: "Métricas por tienda",
    desc: "Composite: totales y prioridad promedio por cliente.",
    apiLine: "GET /api/casos/taller/metricas",
    icon: <IconClipboard size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/salud",
    title: "Estado del API",
    desc: "Comprobar que el backend responde.",
    apiLine: "GET /health",
    icon: <IconHealth size={22} />,
    roles: ["webmaster"],
  },
  {
    to: "/docs",
    title: "Documentación OpenAPI",
    desc: "Esquema interactivo de endpoints (Swagger UI).",
    icon: <IconClipboard size={22} />,
    external: true,
    roles: ["webmaster"],
  },
];

export default function PanelHome() {
  useDocumentTitle("Panel — TrackAid");
  const { user } = useAuth();
  const rol = normalizarRol(user?.rol);
  const cards = allCards.filter((c) => c.roles.includes(rol));
  const showApi = mostrarDetalleApi(user?.rol);

  const subtitleByRol: Record<RolUsuario, string> = {
    usuario: "Registre incidencias y consulte el historial con su correo y nombre.",
    soporte: "Consultas, casos del taller y seguimiento de tickets.",
    webmaster: "Tickets globales, salud del API y documentación OpenAPI.",
  };

  return (
    <>
      <PageHeader
        icon={<IconTicket size={26} />}
        title={`Hola, ${user?.nombre ?? "usuario"}`}
        subtitle={subtitleByRol[rol]}
        meta={
          <span className="badge ok" style={{ fontSize: "0.72rem" }}>
            Sesión activa
          </span>
        }
      />

      <div
        className="grid gap-4 animate-in"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          animationDelay: "0.05s",
        }}
      >
        {cards.map(({ to, title, desc, apiLine, icon, external }) => {
          const hintText =
            showApi && apiLine ? `${desc} (${apiLine})` : desc;
          const inner = (
            <>
              <span
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--accent-muted)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--accent)",
                }}
                aria-hidden
              >
                {icon}
              </span>
              <div>
                <strong style={{ display: "block", marginBottom: "0.35rem" }}>{title}</strong>
                <span className="hint" style={{ margin: 0 }}>
                  {hintText}
                </span>
              </div>
            </>
          );
          const cardStyle = {
            display: "flex" as const,
            gap: "1rem",
            alignItems: "flex-start" as const,
            textDecoration: "none" as const,
            color: "inherit" as const,
          };
          return external ? (
            <a key={to} href={to} target="_blank" rel="noreferrer" className="card" style={cardStyle}>
              {inner}
            </a>
          ) : (
            <Link key={to} to={to} className="card" style={cardStyle}>
              {inner}
            </Link>
          );
        })}
      </div>
    </>
  );
}
