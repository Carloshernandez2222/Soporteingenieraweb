import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLogo } from "./AuthLogo";
import { InputField } from "./InputField";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { Toast } from "./Toast";
import { login as apiLogin } from "@/lib/trackaidApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("Algo salió mal");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError("");
    setShowErrorToast(false);
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Correo electrónico inválido");
      return;
    }
    if (!password.trim()) {
      setErrorToastMessage("Ingrese la contraseña");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }
    setLoading(true);
    const { data, error } = await apiLogin({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      if (error.code === "USER_NOT_FOUND" || error.message.toLowerCase().includes("correo")) {
        setEmailError(error.message);
      } else {
        setErrorToastMessage(error.message);
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
      }
      return;
    }
    if (data?.success) {
      navigate("/");
    }
  }

  function handlePasswordChangeSuccess() {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <AuthLogo />
      <h1 className="mt-8 text-2xl font-bold text-primary text-center">
        Cada pedido es una oportunidad que no se debe perder.
      </h1>
      <p className="mt-2 text-sm text-gray-600 text-center">
        Por favor, ingrese sus datos para continuar.
      </p>

      <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
        <InputField
          label="Correo electrónico"
          id="login-email"
          name="email"
          type="email"
          placeholder="npinzon@finmaq.com.co"
          value={email}
          error={emailError}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
        />
        <div>
          <InputField
            label="Contraseña"
            id="login-password"
            name="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-1 text-right">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Olvidé la contraseña
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>

      <div className="mt-6 w-full">
        <p className="text-center text-sm text-gray-500 mb-4">o continúa con</p>
        <SocialLoginButtons />
      </div>

      <p className="mt-8 text-xs text-gray-400">
        © 2024 TrackAid. Todos los derechos reservados.
      </p>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={handlePasswordChangeSuccess}
      />

      {showErrorToast && (
        <Toast
          variant="error"
          message={errorToastMessage}
          onClose={() => setShowErrorToast(false)}
        />
      )}
      {showSuccessToast && (
        <Toast
          variant="success"
          message="Cambio de contraseña exitoso"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
}
