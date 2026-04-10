import { useCallback, useEffect, useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { IconClipboard } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { CasoTemporal } from "../../types";

function TableSkeleton() {
  return (
    <div className="table-wrap skeleton-table" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-line" style={{ flex: 0.3 }} />
          <div className="skeleton-line" style={{ flex: 1 }} />
          <div className="skeleton-line" style={{ flex: 0.5 }} />
          <div className="skeleton-line" style={{ flex: 0.35 }} />
        </div>
      ))}
    </div>
  );
}

export default function TallerLista() {
  useDocumentTitle("Listado taller");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [rows, setRows] = useState<CasoTemporal[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [load, setLoad] = useState(true);

  const cargar = useCallback(async () => {
    setErr(null);
    setLoad(true);
    setRows(null);
    try {
      const data = await fetchJson<CasoTemporal[]>("/casos/todos");
      setRows(data);
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

  return (
    <>
      <PageHeader
        icon={<IconClipboard size={26} />}
        title="Casos del taller (SQLite)"
        subtitle="Vista tabular de todos los casos persistidos. Pulse «Actualizar» tras crear o modificar datos en otra pestaña."
        meta={
          <button type="button" className="btn secondary" onClick={() => void cargar()} disabled={load}>
            {load ? (
              <>
                <Spinner />
                Sincronizando
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
            <code>GET /casos/todos</code>
          </p>
        )}
        {err && (
          <div className="feedback show err" role="alert">
            {err}
          </div>
        )}
        {load && <TableSkeleton />}
        {!load && rows && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Cliente</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: "1.25rem" }}>
                        No hay registros en la base del taller.
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.id}</strong>
                      </td>
                      <td>{r.cliente}</td>
                      <td>{r.categoria}</td>
                      <td>{r.prioridad}</td>
                      <td>
                        <span className={`badge ${r.activo ? "ok" : "err"}`} style={{ fontSize: "0.7rem" }}>
                          {r.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
