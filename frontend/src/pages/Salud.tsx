import { useEffect, useState } from "react";
import { fetchJson, mensajeError } from "../api";
import { IconHealth } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Salud() {
  useDocumentTitle("Estado del API");
  const [ok, setOk] = useState<boolean | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJson<{ status: string }>("/health");
        if (!cancelled) {
          setOk(data.status === "ok");
          setRaw(JSON.stringify(data, null, 2));
        }
      } catch (e) {
        if (!cancelled) {
          setOk(false);
          setErr(mensajeError(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        icon={<IconHealth size={26} />}
        title="Monitor de disponibilidad"
        subtitle="Comprueba que el servicio responde. Útil tras un despliegue o para diagnóstico rápido."
        meta={
          <span className="badge ok" style={{ fontSize: "0.72rem" }}>
            GET /health
          </span>
        }
      />
      <div className="card animate-in">
        {ok === null && !err && (
          <div className="health-card">
            <span className="health-pulse" aria-hidden />
            <div>
              <strong style={{ display: "block", marginBottom: "0.25rem" }}>Verificando conexión…</strong>
              <span className="hint" style={{ margin: 0 }}>
                Esperando respuesta del backend.
              </span>
            </div>
          </div>
        )}
        {ok !== null && !err && (
          <div className="health-card">
            <span className={`badge ${ok ? "ok" : "err"}`} style={{ fontSize: "0.85rem", padding: "0.5rem 0.85rem" }}>
              {ok ? "Operativo" : "No disponible"}
            </span>
            <div>
              <strong style={{ display: "block", marginBottom: "0.35rem" }}>
                {ok ? "El API respondió correctamente." : "No se pudo validar el estado."}
              </strong>
              <span className="hint" style={{ margin: 0 }}>
                Respuesta reciente del endpoint de salud.
              </span>
            </div>
          </div>
        )}
        {raw && <pre className="json" style={{ marginTop: "1rem" }}>{raw}</pre>}
        {err && (
          <div className="feedback show err" role="alert" style={{ marginTop: "1rem" }}>
            {err}
          </div>
        )}
      </div>
    </>
  );
}
