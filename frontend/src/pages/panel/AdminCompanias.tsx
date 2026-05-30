import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Spinner from "@/components/Spinner";
import { IconClipboard } from "@/components/Icons";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  createCompany,
  listCompaniesAll,
  setCompanyActive,
  type CompanyItem,
} from "@/lib/trackaidApi";

export default function AdminCompanias() {
  useDocumentTitle("Compañías");
  const [items, setItems] = useState<CompanyItem[]>([]);
  const [load, setLoad] = useState(true);
  const [fb, setFb] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [llave, setLlave] = useState("");
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoad(true);
    setFb(null);
    const { data, error } = await listCompaniesAll();
    setLoad(false);
    if (error) {
      setFb(error.message);
      return;
    }
    setItems(data?.data ?? []);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFb(null);
    const { error } = await createCompany({ nombre: nombre.trim(), llave: llave.trim() });
    setSaving(false);
    if (error) {
      setFb(error.message);
      return;
    }
    setNombre("");
    setLlave("");
    void cargar();
  }

  async function toggleActiva(c: CompanyItem) {
    const { error } = await setCompanyActive(c.id, !c.activa);
    if (error) setFb(error.message);
    else void cargar();
  }

  return (
    <>
      <PageHeader
        icon={<IconClipboard size={26} />}
        title="Compañías"
        subtitle="Cree organizaciones con llave única y active o desactive el acceso."
      />
      {fb && (
        <div className="feedback show err" role="alert">
          {fb}
        </div>
      )}
      <form className="card animate-in" onSubmit={(e) => void crear(e)}>
        <h3 className="card-title">Nueva compañía</h3>
        <div className="row-flex">
          <div className="field grow">
            <label htmlFor="cn">Nombre</label>
            <input id="cn" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="field grow">
            <label htmlFor="ck">Llave</label>
            <input id="ck" value={llave} onChange={(e) => setLlave(e.target.value)} required />
          </div>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Guardando…" : "Crear"}
          </button>
        </div>
      </form>

      <div className="card animate-in" style={{ marginTop: "1rem" }}>
        {load ? (
          <Spinner />
        ) : items.length === 0 ? (
          <div className="empty-state">No hay compañías registradas.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Llave</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>
                      <code>{c.llave}</code>
                    </td>
                    <td>
                      <span className={`badge ${c.activa ? "ok" : "warn"}`}>
                        {c.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => void toggleActiva(c)}
                      >
                        {c.activa ? "Desactivar" : "Activar"}
                      </button>
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
