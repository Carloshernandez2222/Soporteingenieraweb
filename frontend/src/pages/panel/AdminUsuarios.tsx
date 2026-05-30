import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Spinner from "@/components/Spinner";
import { IconTicket } from "@/components/Icons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  assignAdminUserCompany,
  createAdminUser,
  listAdminUsers,
  listCompaniesAll,
  setAdminUserActive,
  updateAdminUserPassword,
  updateAdminUserRole,
  type CompanyItem,
  type UserResponse,
} from "@/lib/trackaidApi";
import { etiquetaRol } from "@/lib/roles";

export default function AdminUsuarios() {
  useDocumentTitle("Usuarios");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [load, setLoad] = useState(true);
  const [fb, setFb] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("usuario");
  const [companyId, setCompanyId] = useState("");

  const cargar = useCallback(async () => {
    setLoad(true);
    const [u, c] = await Promise.all([listAdminUsers(), listCompaniesAll()]);
    setLoad(false);
    if (u.error) setFb(u.error.message);
    else setUsers(u.data?.data ?? []);
    if (!c.error) setCompanies(c.data?.data ?? []);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setFb(null);
    const { error } = await createAdminUser({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      password,
      rol,
      companyId: companyId || null,
    });
    if (error) {
      setFb(error.message);
      return;
    }
    setNombre("");
    setApellidos("");
    setEmail("");
    setPassword("");
    void cargar();
  }

  return (
    <>
      <PageHeader
        icon={<IconTicket size={26} />}
        title="Usuarios"
        subtitle="Gestione cuentas, roles, contraseñas y compañías."
      />
      {fb && (
        <div className="feedback show err" role="alert">
          {fb}
        </div>
      )}

      <form className="card animate-in" onSubmit={(e) => void crear(e)}>
        <h3 className="card-title">Nuevo usuario</h3>
        <div className="row-flex" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div className="field">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="field">
            <label>Apellidos</label>
            <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
          </div>
          <div className="field">
            <label>Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>Rol</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="usuario">Usuario</option>
              <option value="soporte">Soporte</option>
              <option value="webmaster">Webmaster</option>
            </select>
          </div>
          <div className="field">
            <label>Compañía</label>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">— Sin asignar —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn primary">
            Crear
          </button>
        </div>
      </form>

      <div className="card animate-in" style={{ marginTop: "1rem" }}>
        {load ? (
          <Spinner />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Compañía</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.nombre} {u.apellidos}
                      <br />
                      <span className="hint">{u.email}</span>
                    </td>
                    <td>{etiquetaRol(u.rol)}</td>
                    <td>{u.companyName ?? "—"}</td>
                    <td>
                      <div className="row-flex" style={{ flexWrap: "wrap", gap: "0.35rem" }}>
                        <select
                          defaultValue={u.rol}
                          onChange={(e) =>
                            void updateAdminUserRole(u.id, e.target.value).then(() => cargar())
                          }
                        >
                          <option value="usuario">Usuario</option>
                          <option value="soporte">Soporte</option>
                          <option value="webmaster">Webmaster</option>
                        </select>
                        <select
                          defaultValue={u.companyId ?? ""}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            void assignAdminUserCompany(u.id, e.target.value).then(() => cargar());
                          }}
                        >
                          <option value="">Asignar compañía…</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => {
                            const pw = window.prompt("Nueva contraseña (mín. 8 caracteres):");
                            if (!pw) return;
                            void updateAdminUserPassword(u.id, pw).then((r) => {
                              if (r.error) setFb(r.error.message);
                              else setFb("Contraseña actualizada.");
                            });
                          }}
                        >
                          Contraseña
                        </button>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() =>
                            void setAdminUserActive(u.id, false).then(() => cargar())
                          }
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
