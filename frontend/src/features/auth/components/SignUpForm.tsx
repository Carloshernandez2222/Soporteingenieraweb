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
  
  // Estados originales
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Nuevos estados para cumplir con el modelo de base de datos
  const [documentNumber, setDocumentNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [sugerirLogin, setSugerirLogin] = useState(false);
  const currentYear = new Date().getFullYear();

  // 1. Mapeo para conectar el nombre del campo del backend con el del frontend
  const mapBackendFieldToFront = (backendField: string) => {
    const mapa: Record<string, string> = {
      first_name: "nombre",
      last_name: "apellidos",
      document_number: "documentNumber",
      company_id: "companyKey",
      email: "email",
      password: "password",
      city: "city",
      address: "address"
    };
    return mapa[backendField] || backendField;
  };

  // 2. Traductor amigable de errores de Pydantic
  const translateError = (msg: string) => {
    if (msg.includes("at least 2 characters")) return "Debe tener al menos 2 caracteres.";
    if (msg.includes("Field required")) return "Este campo es obligatorio.";
    if (msg.includes("valid email")) return "Debe ser un correo válido.";
    return msg;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setSugerirLogin(false);
    setLoading(true);

    const { data, error } = await apiRegister({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      documentNumber: documentNumber.trim(), // Enviamos el documento
      city: city.trim(),                     // Enviamos ciudad para Locations
      address: address.trim(),               // Enviamos dirección para Locations
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
      } 
      // Si FastAPI devuelve un array de errores de validación (Pydantic 422)
      else if (error.details && Array.isArray(error.details)) {
        const fieldErrors: Record<string, string> = {};
        error.details.forEach((err: any) => {
          // Extraemos el nombre del campo que falló (ej. "first_name")
          const fieldName = err.loc?.[err.loc.length - 1];
          if (fieldName) {
            const frontField = mapBackendFieldToFront(fieldName);
            fieldErrors[frontField] = translateError(err.msg);
          }
        });
        setErrors(fieldErrors);
      } 
      // Fallback por si los errores vienen como un objeto normal
      else if (error.details && Object.keys(error.details).length > 0) {
        setErrors(error.details);
      } else {
        setGlobalError(error.message || "Por favor, revisa que todos los campos sean correctos.");
      }
      return;
    }

    if (data?.success && data.user) {
      setUser(data.user, data.accessToken);
      navigate("/panel", { replace: true });
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-stretch pb-8">
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
            <div className="text-sm bg-red-50 p-3 rounded-lg space-y-2 border border-red-100">
              <p className="text-red-600 font-medium">{globalError}</p>
              {sugerirLogin && (
                <p className="text-gray-700">
                  <Link to="/iniciar-sesion" className="text-teal-600 hover:text-teal-700 font-bold underline">
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

          {/* NUEVO CAMPO: Documento */}
          <InputField
            label="Documento de Identidad"
            id="documentNumber"
            name="documentNumber"
            placeholder="Ej. 1020304050"
            value={documentNumber}
            error={errors.documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
          />

          <InputField
            label="Llave privada de compañía"
            id="companyKey"
            name="companyKey"
            placeholder="Ingresa la llave entregada por el webmaster"
            value={companyKey}
            error={errors.companyKey}
            onChange={(e) => setCompanyKey(e.target.value)}
            required
          />

          {/* NUEVOS CAMPOS: Ubicación (Opcionales para el usuario, pero alimentan la BD) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Ciudad (Opcional)"
              id="city"
              name="city"
              placeholder="Ej. Bogotá"
              value={city}
              error={errors.city}
              onChange={(e) => setCity(e.target.value)}
            />
            <InputField
              label="Dirección (Opcional)"
              id="address"
              name="address"
              placeholder="Ej. Calle 123 # 45-67"
              value={address}
              error={errors.address}
              onChange={(e) => setAddress(e.target.value)}
            />
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
            className="w-full py-3.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 mt-4"
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