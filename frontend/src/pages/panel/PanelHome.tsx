import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconClipboard, IconSearch, IconTicket } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { normalizarRol, type RolUsuario } from "@/lib/roles";

type Card = {
  to: string;
  title: string;
  desc: string;
  icon: ReactNode;
  roles: readonly RolUsuario[];
};

const allCards: Card[] = [
  {
    to: "/panel/nuevo-ticket",
    title: "Crear solicitud",
    desc: "Registra una incidencia para que el equipo pueda atenderla.",
    icon: <IconTicket size={22} />,
    roles: ["usuario"],
  },
  {
    to: "/panel/mis-tickets",
    title: "Mis solicitudes",
    desc: "Consulta el estado de lo que has reportado con tu correo.",
    icon: <IconSearch size={22} />,
    roles: ["usuario"],
  },
  {
    to: "/panel/asistente",
    title: "Asistente",
    desc: "Resuelve dudas rápidas y recibe guía para reportar mejor tus casos.",
    icon: <IconClipboard size={22} />,
    roles: ["usuario"],
  },
  {
    to: "/consultar",
    title: "Seguimiento de solicitudes",
    desc: "Cola unificada: asigna agentes, cambia estados y deja comentarios.",
    icon: <IconSearch size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/panel/tickets",
    title: "Solicitudes globales",
    desc: "Vista consolidada para supervisar toda la operación.",
    icon: <IconTicket size={22} />,
    roles: ["webmaster"],
  },
  {
    to: "/panel/admin/companias",
    title: "Compañías",
    desc: "Organizaciones con llave dinámica para vincular usuarios y tickets.",
    icon: <IconClipboard size={22} />,
    roles: ["webmaster"],
  },
  {
    to: "/panel/admin/usuarios",
    title: "Usuarios",
    desc: "Roles, contraseñas y asignación de compañía.",
    icon: <IconTicket size={22} />,
    roles: ["webmaster"],
  },
  {
    to: "/taller/crear",
    title: "Crear caso interno",
    desc: "Registra un caso interno para seguimiento operativo.",
    icon: <IconClipboard size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/taller/filtrar",
    title: "Filtrar casos",
    desc: "Encuentra rápidamente casos internos por tipo.",
    icon: <IconSearch size={22} />,
    roles: ["soporte"],
  },
  {
    to: "/taller/metricas",
    title: "Resumen operativo",
    desc: "Visualiza cargas y prioridades para decidir mejor.",
    icon: <IconClipboard size={22} />,
    roles: ["soporte"],
  },
];

export default function PanelHome() {
  useDocumentTitle("Panel — TrackAid");
  const { user } = useAuth();
  const rol = normalizarRol(user?.rol);
  const cards = allCards.filter((c) => c.roles.includes(rol));

  const subtitleByRol: Record<RolUsuario, string> = {
    usuario: "Crea solicitudes, consulta su avance y usa el asistente desde tu panel.",
    soporte: "Da seguimiento a solicitudes y organiza la operación diaria.",
    webmaster: "Supervisa la operación completa y el flujo global de solicitudes.",
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
        {cards.map(({ to, title, desc, icon }) => {
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
                  {desc}
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
          return (
            <Link key={to} to={to} className="card" style={cardStyle}>
              {inner}
            </Link>
          );
        })}
      </div>
    </>
  );
}
