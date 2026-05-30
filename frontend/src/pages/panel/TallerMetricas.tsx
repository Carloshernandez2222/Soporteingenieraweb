import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { obtenerMetricasJerarquicas } from "@/lib/panelPatronesApi";
import { IconClipboard } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { MetricasJerarquicas } from "../../types";

export default function TallerMetricas() {
  useDocumentTitle("Métricas por tienda");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [data, setData] = useState<MetricasJerarquicas | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [load, setLoad] = useState(true);

  const cargar = useCallback(async () => {
    setErr(null);
    setLoad(true);
    try {
      const res = await obtenerMetricasJerarquicas();
      setData(res.data);
    } catch (e) {
      setErr(mensajeError(e));
      setData(null);
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
        title="Métricas jerárquicas"
        subtitle="Totales y prioridad promedio por tienda/cliente y a nivel global."
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              GET /api/casos/taller/metricas
            </span>
          ) : undefined
        }
      />
      <div className="card animate-in">
        <div className="row-flex" style={{ marginBottom: "1rem", alignItems: "center" }}>
          <button type="button" className="btn secondary" onClick={() => void cargar()} disabled={load}>
            {load ? <Spinner label="Actualizando" /> : "Actualizar"}
          </button>
        </div>

        {load && !data && (
          <p className="hint">
            <Spinner label="Cargando" /> Cargando métricas…
          </p>
        )}
        {err && (
          <div className="feedback show err" role="alert">
            {err}
          </div>
        )}
        {data && (
          <>
            <div className="row-flex" style={{ gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <div className="embed-panel-card" style={{ flex: "1 1 200px", padding: "1rem" }}>
                <p className="hint" style={{ margin: 0 }}>
                  Total casos (global)
                </p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.25rem 0 0" }}>
                  {data.total_casos}
                </p>
              </div>
              <div className="embed-panel-card" style={{ flex: "1 1 200px", padding: "1rem" }}>
                <p className="hint" style={{ margin: 0 }}>
                  Prioridad promedio global
                </p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.25rem 0 0" }}>
                  {data.prioridad_promedio_global}
                </p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tienda / cliente</th>
                    <th>Casos</th>
                    <th>Prioridad media</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tiendas.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="hint">
                        No hay casos en el taller todavía.
                      </td>
                    </tr>
                  ) : (
                    data.tiendas.map((t) => (
                      <tr key={t.nombre}>
                        <td>{t.nombre}</td>
                        <td>{t.total_casos}</td>
                        <td>{t.prioridad_promedio}</td>
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
