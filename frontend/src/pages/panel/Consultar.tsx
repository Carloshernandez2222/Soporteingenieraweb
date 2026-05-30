import { useCallback, useEffect, useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { IconSearch } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { listCompaniesActivas, type CompanyItem } from "@/lib/trackaidApi";

type CasoSoporte = {
  case_id: string;
  solicitante: string;
  solicitante_email: string;
  company_id: string | null;
  company_name: string | null;
  status: string;
  priority: string;
  description: string;
  assigned_to: string | null;
  asignado_nombre: string | null;
  created_at: string;
};

type Agente = { id: string; nombre: string; apellidos: string; email: string; rol: string };

const ESTADOS = ["Abierto", "En progreso", "En espera", "Resuelto", "Cerrado"];

export default function Consultar() {
  useDocumentTitle("Seguimiento de solicitudes");

  const [casos, setCasos] = useState<CasoSoporte[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [companias, setCompanias] = useState<CompanyItem[]>([]);
  const [filtroCompania, setFiltroCompania] = useState("");
  const [load, setLoad] = useState(true);
  const [fb, setFb] = useState<string | null>(null);
  const [sel, setSel] = useState<CasoSoporte | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState("Abierto");
  const [comentario, setComentario] = useState("");
  const [historial, setHistorial] = useState<
    { status: string; comentario: string | null; updated_at: string; updated_by: string }[]
  >([]);

  const cargar = useCallback(async () => {
    setLoad(true);
    setFb(null);
    try {
      const [resCasos, resAgentes, resComp] = await Promise.all([
        fetchJson<{ status: string; data: CasoSoporte[] }>("/api/casos/soporte"),
        fetchJson<{ status: string; data: Agente[] }>("/api/casos/soporte/agentes"),
        listCompaniesActivas(),
      ]);
      setCasos(resCasos.data);
      setAgentes(resAgentes.data);
      if (!resComp.error) setCompanias(resComp.data?.data ?? []);
    } catch (e) {
      setFb(mensajeError(e));
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const visibles = filtroCompania
    ? casos.filter((c) => c.company_id === filtroCompania)
    : casos;

  async function abrirDetalle(c: CasoSoporte) {
    setSel(c);
    setNuevoEstado(c.status);
    setComentario("");
    try {
      const res = await fetchJson<{ status: string; data: typeof historial }>(
        `/api/casos/soporte/${c.case_id}/historial`
      );
      setHistorial(res.data);
    } catch {
      setHistorial([]);
    }
  }

  async function asignar(caseId: string, userId: string) {
    try {
      await fetchJson(`/api/casos/soporte/${caseId}/asignar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToUserId: userId || null }),
      });
      void cargar();
      if (sel?.case_id === caseId) {
        const actualizado = casos.find((x) => x.case_id === caseId);
        if (actualizado) void abrirDetalle(actualizado);
      }
    } catch (e) {
      setFb(mensajeError(e));
    }
  }

  async function guardarEstado() {
    if (!sel) return;
    try {
      await fetchJson(`/api/casos/soporte/${sel.case_id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoEstado, comentario }),
      });
      setComentario("");
      void cargar();
      const actualizado = { ...sel, status: nuevoEstado };
      setSel(actualizado);
      void abrirDetalle(actualizado);
    } catch (e) {
      setFb(mensajeError(e));
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Seguimiento de solicitudes"
        subtitle="Cola unificada: asigne agentes, actualice estados y comente el avance."
      />

      {companias.length > 0 && (
        <div className="companies-carousel animate-in" aria-label="Compañías activas">
          <button
            type="button"
            className={`chip${!filtroCompania ? " active" : ""}`}
            onClick={() => setFiltroCompania("")}
          >
            Todas
          </button>
          {companias.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip${filtroCompania === c.id ? " active" : ""}`}
              onClick={() => setFiltroCompania(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      {fb && (
        <div className="feedback show err" role="alert">
          {fb}
        </div>
      )}

      <div className="card animate-in">
        {load ? (
          <Spinner />
        ) : visibles.length === 0 ? (
          <div className="empty-state">No hay solicitudes en la cola.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Solicitante</th>
                  <th>Compañía</th>
                  <th>Estado</th>
                  <th>Asignado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibles.map((c) => (
                  <tr key={c.case_id}>
                    <td>
                      <strong>{c.solicitante}</strong>
                      <br />
                      <span className="hint">{c.solicitante_email}</span>
                    </td>
                    <td>{c.company_name ?? "—"}</td>
                    <td>
                      <span className="badge">{c.status}</span>
                    </td>
                    <td>{c.asignado_nombre ?? "Sin asignar"}</td>
                    <td>
                      <button type="button" className="btn secondary" onClick={() => void abrirDetalle(c)}>
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sel && (
        <details className="accordion animate-in" open>
          <summary>
            Detalle — {sel.solicitante}
          </summary>
          <div className="accordion-body">
            <p className="hint">{sel.description || "Sin descripción."}</p>

            <div className="field">
              <label>Asignar a</label>
              <select
                value={sel.assigned_to ?? ""}
                onChange={(e) => void asignar(sel.case_id, e.target.value)}
              >
                <option value="">Sin asignar</option>
                {agentes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellidos} ({a.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="row-flex">
              <div className="field grow">
                <label>Estado</label>
                <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                  {ESTADOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field grow">
                <label>Comentario</label>
                <input value={comentario} onChange={(e) => setComentario(e.target.value)} />
              </div>
              <button type="button" className="btn primary" onClick={() => void guardarEstado()}>
                Guardar avance
              </button>
            </div>

            {historial.length > 0 && (
              <ul className="history-list" style={{ marginTop: "1rem" }}>
                {historial.map((h, i) => (
                  <li key={i}>
                    <strong>{h.status}</strong> — {h.updated_by}
                    {h.comentario && <p>{h.comentario}</p>}
                    <span className="hint">{new Date(h.updated_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}
    </>
  );
}
