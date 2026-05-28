import { FormEvent, useState } from "react";
import { mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import {
  crearCasoIntegracion,
  ejemploPayloadIntegracion,
  type OrigenIntegracion,
} from "@/lib/panelPatronesApi";
import { IconClipboard } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function TallerIntegracion() {
  useDocumentTitle("Integración e-commerce");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [origen, setOrigen] = useState<OrigenIntegracion>("amazon");
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(ejemploPayloadIntegracion("amazon"), null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function cargarEjemplo(next: OrigenIntegracion) {
    setOrigen(next);
    setJsonText(JSON.stringify(ejemploPayloadIntegracion(next), null, 2));
    setFb(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFb(null);
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      setFb({ kind: "err", text: "El JSON no es válido." });
      return;
    }
    setLoading(true);
    try {
      const res = await crearCasoIntegracion(origen, payload);
      setFb({
        kind: "ok",
        text: `Caso adaptado desde ${res.origen}: id ${res.data.id}, cliente «${res.data.cliente}», categoría «${res.data.categoria}».`,
      });
    } catch (err) {
      setFb({ kind: "err", text: mensajeError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconClipboard size={26} />}
        title="Integración e-commerce"
        subtitle="Importa información de Amazon o Shopify al formato interno del taller."
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              POST /api/casos/taller/integracion
            </span>
          ) : undefined
        }
      />
      <div className="card animate-in">
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="origen">Origen del payload</label>
            <select
              id="origen"
              value={origen}
              onChange={(e) => cargarEjemplo(e.target.value as OrigenIntegracion)}
            >
              <option value="amazon">Amazon</option>
              <option value="shopify">Shopify</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="payload">JSON externo</label>
            <textarea
              id="payload"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={12}
              style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }}
              spellCheck={false}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Adaptando…
              </>
            ) : (
              "Crear caso adaptado"
            )}
          </button>
        </form>
        {fb && (
          <div className={`feedback show ${fb.kind === "ok" ? "ok" : "err"}`} role="alert">
            {fb.text}
          </div>
        )}
      </div>
    </>
  );
}
