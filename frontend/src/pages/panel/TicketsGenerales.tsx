import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { fetchJson, mensajeError } from "../../api";
import { IconTicket } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatCreatedAt } from "../../lib/formatCreatedAt";

// Ajustado al nuevo modelo unificado de SQL Server (UUIDs y strings)
type Row = {
  clave: string;
  id: string;
  createdAt?: string;
  solicitante: string;
  categoria: string;
  prioridad: string;
  estado: string;
  resumen: string;
};

export default function TicketsGenerales() {
  useDocumentTitle("Casos globales");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [load, setLoad] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const cargar = useCallback(async () => {
    setErr(null);
    setLoad(true);
    try {
      // Ahora usamos un único endpoint unificado
      const respuesta = await fetchJson<{ status: string; data: any[] }>("/api/casos/soporte");
      
      const unificado: Row[] = respuesta.data.map((c) => ({
        clave: `caso-${c.case_id}`,
        id: c.case_id,
        createdAt: c.created_at,
        solicitante: c.user_id, // Muestra el ID del usuario
        categoria: c.type || "General",
        prioridad: c.priority || "Medium",
        estado: c.status,
        resumen: c.description || "Sin descripción",
      }));
      
      setRows(unificado);
    } catch (e) {
      setErr(mensajeError(e));
      setRows(null);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const rowsFiltradas = useMemo(() => {
    if (!rows) return null;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!q) return true;
      return (
        r.solicitante.toLowerCase().includes(q) ||
        r.categoria.toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q) ||
        r.resumen.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) // Ahora busca por UUID
      );
    });
  }, [rows, search]);

  return (
    <>
      <PageHeader
        icon={<IconTicket size={26} />}
        title="Casos y tickets globales"
        subtitle="Vista completa: Todos los casos de soporte (Manuales y Chatbot) en una sola tabla."
        meta={
          <button type="button" className="btn secondary" onClick={() => void cargar()} disabled={load}>
            {load ? (
              <>
                <Spinner />
                Actualizando
              </>
            ) : (
              "Actualizar"
            )}
          </button>
        }
      />

      <div className="card animate-in">
        {verApi && (
          <p className="hint" style={{ marginTop: 0 }}>
            <code>GET /api/casos/soporte</code>
          </p>
        )}
        {err && (
          <div className="feedback show err" role="alert">
            {err}
          </div>
        )}
        {!err && !load && rows && rows.length === 0 && (
          <div className="empty-state">Aún no hay tickets registrados en el sistema.</div>
        )}
        {rows && rows.length > 0 && (
          <>
            <div className="row-flex" style={{ marginBottom: "0.9rem" }}>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="buscarGlobal">Buscar</label>
                <input
                  id="buscarGlobal"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ID, solicitante, categoría, estado o resumen"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="hint" style={{ marginBottom: "0.7rem" }}>
              Mostrando {rowsFiltradas?.length ?? 0} de {rows.length} registros.
            </div>
            
            {/* AQUÍ ESTÁ LA MAGIA DEL SCROLL: max-h-[60vh] y overflow-y-auto */}
            <div className="table-wrap max-h-[60vh] overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Usuario (ID)</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Resumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rowsFiltradas && rowsFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state" style={{ padding: "1.1rem" }}>
                          No hay resultados con esos filtros.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rowsFiltradas?.map((r) => (
                      <tr key={r.clave} className="hover:bg-gray-50">
                        <td>
                          {/* Cortamos el UUID para que no rompa el diseño visualmente */}
                          <strong title={r.id} className="text-xs">
                            #{r.id.substring(0, 8)}...
                          </strong>
                        </td>
                        <td className="text-sm whitespace-nowrap">
                          {r.createdAt ? formatCreatedAt(new Date(r.createdAt).getTime()) : "Sin fecha"}
                        </td>
                        <td className="text-xs text-gray-500" title={r.solicitante}>
                          {r.solicitante.substring(0, 8)}...
                        </td>
                        <td className="text-sm">{r.categoria}</td>
                        <td>
                          <span className={`badge ${r.prioridad.toLowerCase()}`}>
                            {r.prioridad}
                          </span>
                        </td>
                        <td>{r.estado}</td>
                        <td className="text-sm">
                          {r.resumen.slice(0, 70)}
                          {r.resumen.length > 70 ? "…" : ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}