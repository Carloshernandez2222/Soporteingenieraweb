import { useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { IconSearch } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { CasoSqlite } from "../../types";

export default function Consultar() {
  useDocumentTitle("Seguimiento de solicitudes");

  const [email, setEmail] = useState("");
  const [listaEmail, setListaEmail] = useState<CasoSqlite[] | null>(null);
  const [emailFb, setEmailFb] = useState<string | null>(null);
  const [emailLoad, setEmailLoad] = useState(false);

  async function buscarPorEmail() {
    setEmailFb(null);
    setListaEmail(null);
    if (!email.trim()) {
      setEmailFb("Indique un correo electrónico.");
      return;
    }
    setEmailLoad(true);
    try {
      const res = await fetchJson<{ status: string; data: CasoSqlite[] }>(
        `/api/casos/registro/tickets/por-email?${new URLSearchParams({ email: email.trim() })}`
      );
      setListaEmail(res.data);
    } catch (e) {
      setEmailFb(mensajeError(e));
    } finally {
      setEmailLoad(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Seguimiento de solicitudes"
        subtitle="Busca por correo para ver el historial completo y el estado de cada solicitud."
      />

      <details className="accordion animate-in" open>
        <summary>Historial por correo</summary>
        <div className="accordion-body">
          <p className="hint" style={{ marginTop: 0 }}>
            Lista las solicitudes asociadas a un correo, de la más reciente a la más antigua.
          </p>
          <div className="row-flex">
            <div className="field">
              <label htmlFor="em">Correo</label>
              <input
                id="em"
                type="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void buscarPorEmail())}
              />
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => void buscarPorEmail()}
              disabled={emailLoad}
            >
              {emailLoad ? (
                <>
                  <Spinner />
                  Buscando
                </>
              ) : (
                "Buscar historial"
              )}
            </button>
          </div>
          {emailFb && (
            <div className="feedback show err" role="alert">
              {emailFb}
            </div>
          )}
          {listaEmail && (
            <>
              {listaEmail.length === 0 ? (
                <div className="empty-state">No se encontraron registros para ese correo.</div>
              ) : (
                <>
                  <p className="hint" style={{ marginTop: "0.85rem" }}>
                    {listaEmail.length} registro{listaEmail.length !== 1 ? "s" : ""} encontrado
                    {listaEmail.length !== 1 ? "s" : ""}.
                  </p>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Seguimiento</th>
                          <th>Solicitante</th>
                          <th>Resumen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listaEmail.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong>Solicitud #{r.id}</strong>
                            </td>
                            <td>{r.nombre}</td>
                            <td>
                              {r.descripcion.slice(0, 72)}
                              {r.descripcion.length > 72 ? "…" : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </details>
    </>
  );
}
