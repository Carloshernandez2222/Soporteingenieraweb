import { useState } from "react";
import { mensajeError } from "../../api";
import { filtrarCasosTaller } from "@/lib/panelPatronesApi";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { IconSearch } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { CasoTemporal } from "../../types";

export default function TallerFiltrar() {
  useDocumentTitle("Filtro por categoría");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [cat, setCat] = useState("");
  const [rows, setRows] = useState<CasoTemporal[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [load, setLoad] = useState(false);

  async function filtrar() {
    setErr(null);
    setRows(null);
    setLoad(true);
    try {
      const data = await filtrarCasosTaller(cat.trim() || undefined);
      setRows(data);
    } catch (e) {
      setErr(mensajeError(e));
    } finally {
      setLoad(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Filtrar por categoría"
        subtitle="Comparación sin distinguir mayúsculas. Si deja el campo vacío, se muestra el listado completo."
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              GET /api/casos/taller/filtrar
            </span>
          ) : undefined
        }
      />
      <div className="card animate-in">
        <div className="row-flex">
          <div className="field">
            <label htmlFor="cat">Categoría</label>
            <input
              id="cat"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              placeholder="Ej. red"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void filtrar())}
            />
          </div>
          <button type="button" className="btn" onClick={() => void filtrar()} disabled={load}>
            {load ? (
              <>
                <Spinner />
                Aplicando
              </>
            ) : (
              "Aplicar filtro"
            )}
          </button>
        </div>
        {err && (
          <div className="feedback show err" role="alert">
            {err}
          </div>
        )}
        {rows && (
          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Cliente</th>
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state" style={{ padding: "1.25rem" }}>
                        Ningún caso coincide con ese criterio.
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
