import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { registrarCasoStrategy } from "@/lib/panelPatronesApi";
import { IconCheck, IconTicket } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
const MAX_DESC = 4000;

export default function NuevoTicket() {
  useDocumentTitle("Nuevo ticket");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [descLen, setDescLen] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFb(null);

    if (!user?.id) {
      setFb({ kind: "err", text: "Error de autenticación: No se encontró el ID de usuario." });
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const descripcion = String(formData.get("descripcion") ?? "").trim();

    if (!descripcion) {
      setFb({ kind: "err", text: "La descripción no puede estar vacía." });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: user.id, 
        descripcion: descripcion,
        case_type: "General",
        priority: "Medium"
      };

      const data = await registrarCasoStrategy(payload);
      
      setFb({ kind: "ok", text: data.message || "Ticket registrado exitosamente." });
      form.reset();
      setDescLen(0);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Error al registrar el ticket.";
      setFb({ kind: "err", text: errorMsg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconTicket size={26} />}
        title="Registrar incidencia"
        subtitle="Abre un ticket de soporte vinculado a tu cuenta."
        meta={verApi ? <span className="badge ok">POST /api/casos/soporte</span> : undefined}
      />

      <div className="card animate-in" style={{ animationDelay: "0.05s" }}>
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="descripcion">Descripción del problema</label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              maxLength={MAX_DESC}
              placeholder="Detalle el inconveniente aquí..."
              onChange={(e) => setDescLen(e.target.value.length)}
            />
            <div className="char-count">
              {descLen} / {MAX_DESC}
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? <><Spinner label="Enviando" /> Registrando…</> : "Enviar solicitud"}
          </button>
        </form>

        {fb && (
          <div className={`feedback show ${fb.kind === "ok" ? "ok" : "err"}`} role="alert">
            {fb.kind === "ok" && <IconCheck size={22} />}
            <span>{fb.text}</span>
          </div>
        )}
      </div>
    </>
  );
}