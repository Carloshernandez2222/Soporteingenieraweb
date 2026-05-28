import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthLogo } from "./AuthLogo";
import { InputField } from "./InputField";
import { CheckboxWithLinks } from "./CheckboxWithLinks";
import { register as apiRegister } from "@/lib/trackaidApi";

export function SignUpForm() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [sugerirLogin, setSugerirLogin] = useState(false);
  const currentYear = new Date().getFullYear();

  function generarLlaveSegura() {
    const arr = new Uint8Array(12);
    crypto.getRandomValues(arr);
    const raw = Array.from(arr, (n) => n.toString(16).padStart(2, "0")).join("");
    setCompanyKey(`trk-${raw.slice(0, 20)}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setSugerirLogin(false);
    setLoading(true);
    const { data, error } = await apiRegister({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      companyKey: companyKey.trim(),
      password,
      confirmPassword,
      acceptTerms: acceptedTerms,
    });
    setLoading(false);
    if (error) {
      if (error.code === "EMAIL_IN_USE") {
        setGlobalError(error.message);
        setSugerirLogin(true);
      } else if (error.details && Object.keys(error.details).length > 0) {
        setErrors(error.details);
      } else {
        setGlobalError(error.message);
      }
      return;
    }
    if (data?.success && data.user) {
      setUser(data.user, data.accessToken);
      navigate("/panel", { replace: true });
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-stretch">
      <Link
        to="/"
        className="group self-start mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary-light transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      >
        <span aria-hidden className="text-base leading-none transition-transform group-hover:-translate-x-0.5">
          ←
        </span>
        Volver
      </Link>
      <div className="flex flex-col items-center w-full">
      <AuthLogo />
      <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
        {globalError && (
          <div className="text-sm bg-red-50 p-3 rounded-lg space-y-2">
            <p className="text-red-600">{globalError}</p>
            {sugerirLogin && (
              <p className="text-gray-700">
                <Link to="/iniciar-sesion" className="text-teal-600 hover:text-teal-700 font-medium">
                  Inicia sesión aquí
                </Link>{" "}
                con esa cuenta.
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Nombre"
            id="nombre"
            name="nombre"
            placeholder="Nombre"
            value={nombre}
            error={errors.nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <InputField
            label="Apellidos"
            id="apellidos"
            name="apellidos"
            placeholder="Apellidos"
            value={apellidos}
            error={errors.apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </div>
        <InputField
          label="Llave privada de compañía"
          id="companyKey"
          name="companyKey"
          placeholder="trk-xxxxxxxxxxxxxxxxxxxx"
          value={companyKey}
          error={errors.companyKey}
          onChange={(e) => setCompanyKey(e.target.value)}
          required
        />
        <div className="-mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Solo se usa la llave. No se solicita nombre de empresa para proteger su privacidad.
          </p>
          <button
            type="button"
            onClick={generarLlaveSegura}
            className="text-xs rounded-md border border-teal-200 px-2 py-1 text-teal-700 hover:bg-teal-50"
          >
            Generar llave
          </button>
        </div>
        <InputField
          label="Correo"
          id="email"
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSugerirLogin(false);
            setGlobalError("");
          }}
          required
        />
        <InputField
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <InputField
          label="Confirmar contraseña"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <CheckboxWithLinks
          id="terms"
          label="Acepto los"
          termsHref="/terminos-y-condiciones"
          privacyHref="/politica-de-privacidad"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link to="/iniciar-sesion" className="text-teal-600 hover:text-teal-700 font-medium">
          Iniciar sesión
        </Link>
      </p>

      <p className="mt-8 text-xs text-gray-400">
        © {currentYear} TrackAid. Todos los derechos reservados.
      </p>
      </div>
    </div>
  );
}
