import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { fetchJson, mensajeError } from "../../api";
import { IconTicket } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatCreatedAt } from "../../lib/formatCreatedAt";
import type { CasoSqlite, CasoTemporal } from "../../types";

type Row = {
  clave: string;
  tipo: "Caso" | "Ticket";
  id: number;
  createdAt?: number;
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
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | Row["tipo"]>("todos");

  const cargar = useCallback(async () => {
    setErr(null);
    setLoad(true);
    try {
      const [casos, tickets] = await Promise.all([
        fetchJson<CasoTemporal[]>("/casos/todos"),
        fetchJson<{ status: string; data: CasoSqlite[] }>("/casos/sqlite/todos"),
      ]);
      const unificado: Row[] = [
        ...casos.map((c) => ({
          clave: `caso-${c.id}`,
          tipo: "Caso" as const,
          id: c.id,
          createdAt: c.created_at,
          solicitante: c.cliente,
          categoria: c.categoria,
          prioridad: String(c.prioridad),
          estado: c.activo ? "Activo" : "Inactivo",
          resumen: "Caso creado en taller de soporte",
        })),
        ...tickets.data.map((t) => ({
          clave: `ticket-${t.id}`,
          tipo: "Ticket" as const,
          id: t.id,
          createdAt: t.created_at,
          solicitante: t.nombre,
          categoria: t.categoria ?? "general",
          prioridad: "—",
          estado: "Registrado",
          resumen: t.descripcion,
        })),
      ].sort((a, b) => b.id - a.id);
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
      const okTipo = tipoFiltro === "todos" ? true : r.tipo === tipoFiltro;
      if (!okTipo) return false;
      if (!q) return true;
      return (
        r.solicitante.toLowerCase().includes(q) ||
        r.categoria.toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q) ||
        r.resumen.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    });
  }, [rows, search, tipoFiltro]);

  return (
    <>
      <PageHeader
        icon={<IconTicket size={26} />}
        title="Casos y tickets globales"
        subtitle="Vista completa (solo webmaster): casos de soporte + tickets generales en una sola tabla."
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
            <code>GET /casos/todos</code> + <code>GET /casos/sqlite/todos</code>
          </p>
        )}
        {err && (
          <div className="feedback show err" role="alert">
            {err}
          </div>
        )}
        {!err && !load && rows && rows.length === 0 && (
          <div className="empty-state">Aún no hay tickets registrados.</div>
        )}
        {rows && rows.length > 0 && (
          <>
            <div className="row-flex" style={{ marginBottom: "0.9rem" }}>
              <div className="field">
                <label htmlFor="buscarGlobal">Buscar</label>
                <input
                  id="buscarGlobal"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ID, solicitante, categoría, estado o resumen"
                />
              </div>
              <div className="field">
                <label htmlFor="tipoGlobal">Tipo</label>
                <select
                  id="tipoGlobal"
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value as "todos" | Row["tipo"])}
                >
                  <option value="todos">Todos</option>
                  <option value="Caso">Casos</option>
                  <option value="Ticket">Tickets</option>
                </select>
              </div>
            </div>
            <div className="hint" style={{ marginBottom: "0.7rem" }}>
              Mostrando {rowsFiltradas?.length ?? 0} de {rows.length} registros.
            </div>
            <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Solicitante</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Resumen</th>
                </tr>
              </thead>
              <tbody>
                {rowsFiltradas && rowsFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state" style={{ padding: "1.1rem" }}>
                        No hay resultados con esos filtros.
                      </div>
                    </td>
                  </tr>
                ) : (
                  rowsFiltradas?.map((r) => (
                    <tr key={r.clave}>
                      <td>{r.tipo}</td>
                      <td>
                        <strong>#{r.id}</strong>
                      </td>
                      <td>{formatCreatedAt(r.createdAt)}</td>
                      <td>{r.solicitante}</td>
                      <td>{r.categoria}</td>
                      <td>{r.prioridad}</td>
                      <td>{r.estado}</td>
                      <td>
                        {r.resumen.slice(0, 86)}
                        {r.resumen.length > 86 ? "…" : ""}
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

