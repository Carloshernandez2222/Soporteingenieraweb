import { useState } from "react";
import { fetchJson, mensajeError } from "../../api";
import { useAuth } from "@/context/AuthContext";
import { mostrarDetalleApi } from "@/lib/panelApiHints";
import { IconSearch } from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { CasoSqlite } from "../../types";

const NOMBRE_PATTERN = "^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\\s'.-]+$";
const MAX_NOMBRE = 120;

export default function MisTickets() {
  useDocumentTitle("Mis tickets");
  const { user } = useAuth();
  const verApi = mostrarDetalleApi(user?.rol);
  const [email, setEmail] = useState(user?.email ?? "");
  const [nombre, setNombre] = useState("");
  const [nombreLen, setNombreLen] = useState(0);
  const [lista, setLista] = useState<CasoSqlite[] | null>(null);
  const [fb, setFb] = useState<string | null>(null);
  const [load, setLoad] = useState(false);

  async function buscar() {
    setFb(null);
    setLista(null);
    const em = email.trim();
    const nom = nombre.trim();
    if (!em) {
      setFb("Indique el correo con el que registró el ticket.");
      return;
    }
    if (!nom) {
      setFb("Indique el nombre completo tal como lo escribió al registrar la incidencia.");
      return;
    }
    if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'.-]+$/.test(nom)) {
      setFb("El nombre no puede contener dígitos (misma regla que al registrar).");
      return;
    }
    setLoad(true);
    try {
      const res = await fetchJson<{ status: string; data: CasoSqlite[] }>(
        `/casos/sqlite/por-solicitante?${new URLSearchParams({ email: em, nombre: nom })}`
      );
      setLista(res.data);
    } catch (e) {
      setFb(mensajeError(e));
    } finally {
      setLoad(false);
    }
  }

  return (
    <>
      <PageHeader
        icon={<IconSearch size={26} />}
        title="Mis tickets"
        subtitle="Busque las incidencias que registró usando el mismo correo y nombre completos que en el formulario de alta (validación en el servidor)."
        meta={
          verApi ? (
            <span className="badge ok" style={{ fontSize: "0.72rem" }}>
              GET /casos/sqlite/por-solicitante
            </span>
          ) : undefined
        }
      />

      <div className="card animate-in" style={{ animationDelay: "0.05s" }}>
        <div className="row-flex" style={{ flexWrap: "wrap", alignItems: "flex-end", gap: "1rem" }}>
          <div className="field" style={{ flex: "1 1 220px" }}>
            <label htmlFor="mt-email">Correo</label>
            <input
              id="mt-email"
              type="email"
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void buscar())}
            />
          </div>
          <div className="field" style={{ flex: "1 1 220px" }}>
            <label htmlFor="mt-nombre">Nombre completo (como al registrar)</label>
            <input
              id="mt-nombre"
              maxLength={MAX_NOMBRE}
              pattern={NOMBRE_PATTERN}
              title="Letras, espacios, apóstrofes y guiones; sin dígitos"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setNombreLen(e.target.value.length);
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void buscar())}
            />
            <div className={`char-count${nombreLen > MAX_NOMBRE * 0.9 ? " warn" : ""}`}>
              {nombreLen} / {MAX_NOMBRE}
            </div>
          </div>
          <button type="button" className="btn" onClick={() => void buscar()} disabled={load}>
            {load ? (
              <>
                <Spinner />
                Buscando
              </>
            ) : (
              "Buscar mis tickets"
            )}
          </button>
        </div>
        {fb && (
          <div className="feedback show err" role="alert" style={{ marginTop: "1rem" }}>
            {fb}
          </div>
        )}
        {lista && (
          <div style={{ marginTop: "1.25rem" }}>
            {lista.length === 0 ? (
              <div className="empty-state">No hay tickets que coincidan con ese correo y nombre.</div>
            ) : (
              <>
                <p className="hint" style={{ marginTop: 0 }}>
                  {lista.length} ticket{lista.length !== 1 ? "s" : ""} encontrado
                  {lista.length !== 1 ? "s" : ""}.
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
                      {lista.map((r) => (
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
          </div>
        )}
      </div>
    </>
  );
}
