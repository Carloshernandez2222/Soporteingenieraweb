import { FormEvent, useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { normalizarRol } from "@/lib/roles";
import { IconCheck, IconTicket } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { RegistroOk } from "../../types";

const NOMBRE_PATTERN = "^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\\s'.-]+$";
const MAX_NOMBRE = 120;
const MAX_DESC = 4000;

export default function NuevoTicket() {
  useDocumentTitle("Nuevo ticket");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [nombreLen, setNombreLen] = useState(0);
  const [descLen, setDescLen] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFb(null);
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const fd = new FormData(form);
    const params = new URLSearchParams({
      nombre: String(fd.get("nombre") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      descripcion: String(fd.get("descripcion") ?? "").trim(),
      categoria: "general",
      creado_por_rol: normalizarRol(user?.rol),
    });
    setLoading(true);
    try {
      const data = await fetchJson<RegistroOk>(`/registrar?${params}`, {
        method: "POST",
      });
      setFb({ kind: "ok", text: data.message || data.msg });
      form.reset();
      setNombreLen(0);
      setDescLen(0);
    } catch (err) {
      setFb({ kind: "err", text: mensajeError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconTicket size={26} />}
        title="Registrar incidencia"
        subtitle="Abre un ticket en la base de datos. Los datos se validan en el servidor: nombre sin dígitos, correo normalizado y límites de longitud."
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              POST /registrar
            </span>
          ) : undefined
        }
      />

      <div className="card animate-in" style={{ animationDelay: "0.05s" }}>
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="nombre">Solicitante (nombre completo)</label>
            <input
              id="nombre"
              name="nombre"
              required
              minLength={1}
              maxLength={MAX_NOMBRE}
              pattern={NOMBRE_PATTERN}
              title="Letras, espacios, apóstrofes y guiones; sin dígitos"
              autoComplete="name"
              onChange={(e) => setNombreLen(e.target.value.length)}
            />
            <div className={`char-count${nombreLen > MAX_NOMBRE * 0.9 ? " warn" : ""}`}>
              {nombreLen} / {MAX_NOMBRE}
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Correo de contacto</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="nombre@organizacion.com"
              defaultValue={user?.email ?? ""}
              key={user?.email ?? "sin-correo"}
            />
            <p className="hint">Se usará para localizar sus tickets posteriores.</p>
          </div>
          <div className="field">
            <label htmlFor="descripcion">Descripción del problema</label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              minLength={1}
              maxLength={MAX_DESC}
              placeholder="Síntomas, pasos para reproducir, mensaje de error…"
              onChange={(e) => setDescLen(e.target.value.length)}
            />
            <div className={`char-count${descLen > MAX_DESC * 0.9 ? " warn" : ""}`}>
              {descLen} / {MAX_DESC}
            </div>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <>
                <Spinner label="Enviando" />
                Registrando…
              </>
            ) : (
              "Enviar solicitud"
            )}
          </button>
        </form>
        {fb && (
          <div className={`feedback show ${fb.kind === "ok" ? "ok" : "err"}`} role="alert">
            {fb.kind === "ok" && (
              <span className="feedback-lead-icon" aria-hidden>
                <IconCheck size={22} />
              </span>
            )}
            <span>{fb.text}</span>
          </div>
        )}
      </div>
    </>
  );
}
