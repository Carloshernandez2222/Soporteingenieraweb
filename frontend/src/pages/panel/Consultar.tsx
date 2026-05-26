import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { fetchJson, mensajeError } from "../../api";
import { obtenerCasoTaller } from "@/lib/panelPatronesApi";
import JsonBlock from "../../components/JsonBlock";
import { IconSearch } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { CasoSqlite } from "../../types";

export default function Consultar() {
  useDocumentTitle("Consultas");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [tempId, setTempId] = useState("");
  const [tempJson, setTempJson] = useState<string | null>(null);
  const [tempFb, setTempFb] = useState<string | null>(null);
  const [tempLoad, setTempLoad] = useState(false);

  const [email, setEmail] = useState("");
  const [listaEmail, setListaEmail] = useState<CasoSqlite[] | null>(null);
  const [emailFb, setEmailFb] = useState<string | null>(null);
  const [emailLoad, setEmailLoad] = useState(false);

  const [pid, setPid] = useState("");
  const [persistJson, setPersistJson] = useState<string | null>(null);
  const [persistFb, setPersistFb] = useState<string | null>(null);
  const [persistLoad, setPersistLoad] = useState(false);

  async function buscarTemporal() {
    setTempFb(null);
    setTempJson(null);
    if (!tempId.trim()) {
      setTempFb("Indique un identificador numérico.");
      return;
    }
    setTempLoad(true);
    try {
      const data = await obtenerCasoTaller(Number(tempId.trim()));
      setTempJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setTempFb(mensajeError(e));
    } finally {
      setTempLoad(false);
    }
  }

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

  async function buscarPersistido() {
    setPersistFb(null);
    setPersistJson(null);
    if (!pid.trim()) {
      setPersistFb("Indique el número de ticket (id en base de datos).");
      return;
    }
    setPersistLoad(true);
    try {
      const res = await fetchJson<{ status: string; data: CasoSqlite }>(
        `/api/casos/registro/tickets/${encodeURIComponent(pid)}`
      );
      setPersistJson(JSON.stringify(res.data, null, 2));
    } catch (e) {
      setPersistFb(mensajeError(e));
    } finally {
      setPersistLoad(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Consultas y seguimiento"
        subtitle={
          verApi
            ? "Tres vías: caso del taller en SQLite, historial de tickets por correo en SQLite y detalle de ticket por número."
            : "Tres formas de consulta: caso del taller, historial por correo y detalle por número de ticket."
        }
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              GET
            </span>
          ) : undefined
        }
      />

      <details className="accordion animate-in" open>
        <summary>Caso del taller (SQLite)</summary>
        <div className="accordion-body">
          {verApi ? (
            <p className="hint" style={{ marginTop: 0 }}>
              Endpoint <code>GET /api/casos/taller/{"{id}"}</code>. Registros creados con{" "}
              <code>POST /api/casos/taller</code> (tabla <code>casos_taller</code>).
            </p>
          ) : (
            <p className="hint" style={{ marginTop: 0 }}>
              Use el identificador del caso creado desde «Crear caso» en el taller.
            </p>
          )}
          <div className="row-flex">
            <div className="field">
              <label htmlFor="tid">Identificador</label>
              <input
                id="tid"
                type="number"
                min={1}
                step={1}
                value={tempId}
                onChange={(e) => setTempId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void buscarTemporal())}
              />
            </div>
            <button type="button" className="btn" onClick={() => void buscarTemporal()} disabled={tempLoad}>
              {tempLoad ? (
                <>
                  <Spinner />
                  Consultando
                </>
              ) : (
                "Consultar"
              )}
            </button>
          </div>
          {tempFb && (
            <div className="feedback show err" role="alert">
              {tempFb}
            </div>
          )}
          {tempJson && <JsonBlock value={tempJson} />}
        </div>
      </details>

      <details className="accordion animate-in" style={{ animationDelay: "0.06s" }}>
        <summary>Tickets por correo (base de datos)</summary>
        <div className="accordion-body">
          {verApi ? (
            <p className="hint" style={{ marginTop: 0 }}>
              Endpoint <code>GET /api/casos/registro/tickets/por-email?email=</code>.
            </p>
          ) : (
            <p className="hint" style={{ marginTop: 0 }}>
              Lista los tickets asociados a ese correo, del más reciente al más antiguo.
            </p>
          )}
          <div className="row-flex">
            <div className="field">
              <label htmlFor="em">Correo del solicitante</label>
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
                          <th>Ticket</th>
                          <th>Solicitante</th>
                          <th>Resumen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listaEmail.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong>#{r.id}</strong>
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

      <details className="accordion animate-in" style={{ animationDelay: "0.12s" }}>
        <summary>Detalle de ticket por número</summary>
        <div className="accordion-body">
          {verApi ? (
            <p className="hint" style={{ marginTop: 0 }}>
              Endpoint <code>GET /api/casos/registro/tickets/{"{id}"}</code>.
            </p>
          ) : (
            <p className="hint" style={{ marginTop: 0 }}>
              Muestra el ticket completo a partir del número asignado al registrar la incidencia.
            </p>
          )}
          <div className="row-flex">
            <div className="field">
              <label htmlFor="pid">Número de ticket</label>
              <input
                id="pid"
                type="number"
                min={1}
                step={1}
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void buscarPersistido())}
              />
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => void buscarPersistido()}
              disabled={persistLoad}
            >
              {persistLoad ? (
                <>
                  <Spinner />
                  Obteniendo
                </>
              ) : (
                "Ver detalle"
              )}
            </button>
          </div>
          {persistFb && (
            <div className="feedback show err" role="alert">
              {persistFb}
            </div>
          )}
          {persistJson && <JsonBlock value={persistJson} />}
        </div>
      </details>
    </>
  );
}
