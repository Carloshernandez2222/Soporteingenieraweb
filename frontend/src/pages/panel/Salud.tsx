import { useEffect, useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { IconHealth } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Salud() {
  useDocumentTitle("Estado del servicio");
  const [ok, setOk] = useState<boolean | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [frontendBuildMissing, setFrontendBuildMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJson<{
          status: string;
          frontend_index?: boolean;
          frontend_assets?: boolean;
          frontend_images?: boolean;
        }>("/health");
        if (!cancelled) {
          setOk(data.status === "ok");
          setRaw(JSON.stringify(data, null, 2));
          setFrontendBuildMissing(
            data.frontend_index === false ||
              data.frontend_assets === false ||
              data.frontend_images === false,
          );
        }
      } catch (e) {
        if (!cancelled) {
          setOk(false);
          setErr(mensajeError(e));
          setFrontendBuildMissing(false);
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
        subtitle="Comprueba que el servicio responde. Útil para diagnóstico rápido."
      />
      <div className="card animate-in">
        {ok === null && !err && (
          <div className="health-card">
            <span className="health-pulse" aria-hidden />
            <div>
              <strong style={{ display: "block", marginBottom: "0.25rem" }}>Verificando conexión…</strong>
              <span className="hint" style={{ margin: 0 }}>
                Esperando respuesta del servicio.
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
                Última respuesta del sistema.
              </span>
            </div>
          </div>
        )}
        {raw && <pre className="json" style={{ marginTop: "1rem" }}>{raw}</pre>}
        {frontendBuildMissing && (
          <div className="feedback show err" role="alert" style={{ marginTop: "1rem" }}>
            El servicio principal responde, pero falta publicar correctamente la interfaz web.
          </div>
        )}
        {err && (
          <div className="feedback show err" role="alert" style={{ marginTop: "1rem" }}>
            {err}
          </div>
        )}
      </div>
    </>
  );
}
