import { useMemo, useState } from "react";

import { FLandingSection, FPatternRow } from "../layout";

const LOGROS = [
  "Reducir en un 32% las cancelaciones evitables",
  "Disminuir en un 41% los reclamos post-venta",
  "Mejorar en un 27% los tiempos de resolución",
];

type EstadoTicket = "todos" | "en_proceso" | "resuelto";

type Ticket = {
  id: string;
  cliente: string;
  prioridad: "Alta" | "Media" | "Baja";
  estado: Exclude<EstadoTicket, "todos">;
};

const TICKETS: Ticket[] = [
  { id: "#2041", cliente: "Homecenter", prioridad: "Alta", estado: "en_proceso" },
  { id: "#2043", cliente: "Shopify", prioridad: "Media", estado: "resuelto" },
  { id: "#2044", cliente: "Amazon", prioridad: "Alta", estado: "en_proceso" },
  { id: "#2047", cliente: "Mercado Libre", prioridad: "Baja", estado: "resuelto" },
  { id: "#2050", cliente: "AliExpress", prioridad: "Media", estado: "resuelto" },
  { id: "#2052", cliente: "Temu", prioridad: "Alta", estado: "en_proceso" },
  { id: "#2055", cliente: "Ripley", prioridad: "Media", estado: "resuelto" },
  { id: "#2058", cliente: "Falabella", prioridad: "Baja", estado: "resuelto" },
];

function MiniDashboard() {
  const [filtro, setFiltro] = useState<EstadoTicket>("todos");
  const filtrados = useMemo(
    () => (filtro === "todos" ? TICKETS : TICKETS.filter((t) => t.estado === filtro)),
    [filtro]
  );
  const activos = TICKETS.filter((t) => t.estado !== "resuelto").length;
  const resueltos = TICKETS.filter((t) => t.estado === "resuelto").length;
  const filasVisibles = 6;
  const vacias = Math.max(0, filasVisibles - filtrados.length);

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-850">Mini dashboard de tickets</h3>
        <span className="text-xs text-gray-500">Vista de operación</span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 p-3 bg-white">
            <p className="text-xs text-gray-500">Tickets activos</p>
            <p className="text-xl font-bold text-gray-850">{activos}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 bg-white">
            <p className="text-xs text-gray-500">Resueltas / estabilizadas</p>
            <p className="text-xl font-bold text-gray-850">{resueltos}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["todos", "Todos"],
            ["en_proceso", "En proceso"],
            ["resuelto", "Resuelto"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFiltro(key as EstadoTicket)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                filtro === key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden min-h-[290px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Ticket</th>
                <th className="text-left px-3 py-2 font-medium">Cliente</th>
                <th className="text-left px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-semibold text-gray-850">{t.id}</td>
                  <td className="px-3 py-2 text-gray-700">{t.cliente}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.estado === "resuelto"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {t.estado === "en_proceso" ? "En proceso" : "Resuelto"}
                    </span>
                  </td>
                </tr>
              ))}
              {Array.from({ length: vacias }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-transparent select-none">#0000</td>
                  <td className="px-3 py-2 text-transparent select-none">Placeholder</td>
                  <td className="px-3 py-2 text-transparent select-none">Estado</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CasoExito() {
  return (
    <FLandingSection id="servicios" className="bg-gray-50/50">
      <FPatternRow
        visual={
          <div className="flex justify-center lg:justify-start w-full">
            <MiniDashboard />
          </div>
        }
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-850 leading-tight">
          De tickets invisibles a control operativo real
        </h2>
        <p className="mt-6 text-gray-600">
          Una marca de eCommerce en crecimiento enfrentaba cancelaciones recurrentes causadas por
          fallas en integraciones logísticas y retrasos no detectados.
        </p>
        <p className="mt-4 text-gray-850 font-medium">
          Tras implementar monitoreo continuo del flujo de pedidos, logró:
        </p>
        <ul className="mt-4 space-y-2">
          {LOGROS.map((item) => (
            <li key={item} className="flex gap-2 text-gray-600">
              <span className="text-primary font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-gray-600">
          Al obtener visibilidad operativa, transformó el soporte en prevención y protegió ingresos
          ya generados.
        </p>
      </FPatternRow>
    </FLandingSection>
  );
}
