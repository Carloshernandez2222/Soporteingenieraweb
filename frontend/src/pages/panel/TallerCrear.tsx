import { FormEvent, useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { IconClipboard } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { CasoTemporal } from "../../types";

export default function TallerCrear() {
  useDocumentTitle("Crear caso taller");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFb(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const id = Number(fd.get("id"));
    const prioridad = Number(fd.get("prioridad"));
    const body = {
      id: Number.isFinite(id) ? id : 0,
      cliente: String(fd.get("cliente") ?? "").trim(),
      activo: fd.get("activo") === "on",
      prioridad: Number.isFinite(prioridad) ? prioridad : 0,
      categoria: String(fd.get("categoria") ?? "").trim(),
    };
    setLoading(true);
    try {
      const res = await fetchJson<{ status: string; data: CasoTemporal }>("/casos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setFb({
        kind: "ok",
        text: `Registro guardado en SQLite (taller): id ${res.data.id}, cliente «${res.data.cliente}», categoría «${res.data.categoria}».`,
      });
      form.reset();
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
        title="Alta de caso (taller)"
        subtitle="Persistido en SQLite (tabla casos_taller). El id debe ser único."
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              POST /casos/crear
            </span>
          ) : undefined
        }
      />
      <div className="card animate-in">
        <form onSubmit={onSubmit}>
          <div className="row-flex">
            <div className="field">
              <label htmlFor="id">Id numérico (único)</label>
              <input id="id" name="id" type="number" required step={1} />
            </div>
            <div className="field">
              <label htmlFor="prioridad">Prioridad (0–10)</label>
              <input
                id="prioridad"
                name="prioridad"
                type="number"
                required
                min={0}
                max={10}
                step={0.1}
                defaultValue={3}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="cliente">Cliente</label>
            <input id="cliente" name="cliente" required maxLength={120} placeholder="Sin dígitos en el nombre" />
          </div>
          <div className="field">
            <label htmlFor="categoria">Categoría</label>
            <input id="categoria" name="categoria" required maxLength={64} placeholder="Ej. red, software" />
          </div>
          <div className="field">
            <label className="checkbox-label">
              <input name="activo" type="checkbox" defaultChecked /> Caso activo
            </label>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Guardando…
              </>
            ) : (
              "Guardar en base de datos"
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
