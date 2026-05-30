import { useState, useEffect, useCallback } from "react";
import { fetchJson, mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { IconSearch } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

type CasoSoporteProf = {
  case_id: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
};

export default function MisTickets() {
  useDocumentTitle("Mis tickets");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  
  const [lista, setLista] = useState<CasoSoporteProf[] | null>(null);
  const [fb, setFb] = useState<string | null>(null);
  const [load, setLoad] = useState(false);

  const buscarTickets = useCallback(async () => {
    if (!user?.id) return;
    setFb(null);
    setLoad(true);
    try {
      const res = await fetchJson<{ status: string; data: CasoSoporteProf[] }>(
        `/api/casos/soporte/mis-tickets/${user.id}`
      );
      setLista(res.data);
    } catch (e) {
      setFb(mensajeError(e));
    } finally {
      setLoad(false);
    }
  }, [user?.id]);

  useEffect(() => {
    buscarTickets();
  }, [buscarTickets]);

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Mis tickets"
        subtitle="Consulta el historial de tus incidencias."
        meta={verApi ? <span className="badge ok" style={{ fontSize: "0.72rem" }}>GET /api/casos/soporte/mis-tickets/{"{user_id}"}</span> : undefined}
      />

      <div className="card animate-in" style={{ animationDelay: "0.05s" }}>
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <p style={{ margin: 0 }}>Historial asociado a tu cuenta.</p>
           <button type="button" className="btn secondary" onClick={buscarTickets} disabled={load}>
            {load ? <><Spinner /> Actualizando</> : "Refrescar"}
          </button>
        </div>

        {load && !lista && <div style={{ textAlign: "center", padding: "2rem" }}><Spinner /> Cargando tus tickets...</div>}
        {fb && <div className="feedback show err" role="alert">{fb}</div>}

        {lista && !load && (
          <div className="table-wrap max-h-[60vh] overflow-y-auto"> {/* Scroll habilitado */}
            {lista.length === 0 ? (
              <div className="empty-state">No tienes tickets registrados.</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>ID Ticket</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((r) => (
                    <tr key={r.case_id}>
                      <td><strong>#{r.case_id.split("-")[0]}</strong></td>
                      <td>{r.description.length > 50 ? r.description.slice(0, 50) + "..." : r.description}</td>
                      <td>{r.type}</td>
                      <td>
                        <span className={`badge ${r.priority.toLowerCase() === 'high' ? 'err' : 'ok'}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td>{r.status}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}