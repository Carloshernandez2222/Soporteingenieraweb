import { useState } from "react";
import { InputField } from "./InputField";
import {
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
} from "@/lib/trackaidApi";

type Step = "email" | "password";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: "Escriba al menos 8 caracteres" };
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password))
    return { valid: false, message: "Combine letras mayúsculas y minúsculas" };
  if (!/[^a-zA-Z0-9]/.test(password))
    return { valid: false, message: "Incluya al menos un símbolo" };
  return { valid: true };
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setSubmitError("");
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Correo electrónico inválido");
      return;
    }
    if (email.trim() !== confirmEmail.trim()) {
      setEmailError("Los correos no coinciden");
      return;
    }
    setLoading(true);
    const { data, error } = await apiForgotPassword({
      email: email.trim(),
      confirmEmail: confirmEmail.trim(),
    });
    setLoading(false);
    if (error) {
      setEmailError(error.details?.email ?? error.message);
      return;
    }
    if (data?.resetToken) {
      setResetToken(data.resetToken);
    }
    setStep("password");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setNewPasswordError("");
    setConfirmPasswordError("");
    setSubmitError("");
    const pwdCheck = validatePassword(newPassword);
    if (!pwdCheck.valid) {
      setNewPasswordError(pwdCheck.message ?? "Contraseña no válida");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("La contraseña no coincide");
      return;
    }
    if (!resetToken) {
      setSubmitError("Solicite primero el restablecimiento con su correo.");
      return;
    }
    setLoading(true);
    const { data, error } = await apiResetPassword({
      token: resetToken,
      newPassword,
      confirmPassword,
    });
    setLoading(false);
    if (error) {
      if (error.details?.newPassword) setNewPasswordError(error.details.newPassword);
      else if (error.details?.confirmPassword) setConfirmPasswordError(error.details.confirmPassword);
      else setSubmitError(error.message);
      return;
    }
    if (data?.success) {
      onSuccess?.();
      onClose();
      setStep("email");
      setEmail("");
      setConfirmEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
    }
  }

  function handleClose() {
    onClose();
    setStep("email");
    setEmailError("");
    setConfirmPasswordError("");
    setSubmitError("");
    setResetToken("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-gray-850">
          Es necesario que cambie su contraseña por seguridad.
        </h2>

        {step === "email" ? (
          <form onSubmit={handleSendEmail} className="mt-6 space-y-4">
            {submitError && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{submitError}</p>
            )}
            <InputField
              label="Correo"
              id="modal-email"
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              error={emailError}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Confirme su correo"
              id="modal-confirm-email"
              name="confirmEmail"
              type="email"
              placeholder="Confirme su correo"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Al hacer clic en &quot;Enviar correo&quot;, acepta nuestros{" "}
              <a href="#terminos" className="text-teal-600 hover:underline">Términos de uso</a> y nuestra{" "}
              <a href="#privacidad" className="text-teal-600 hover:underline">Política de privacidad</a>.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar correo"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            {submitError && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{submitError}</p>
            )}
            <InputField
              label="Nueva contraseña"
              id="modal-new-password"
              name="newPassword"
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              error={newPasswordError}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <InputField
              label="Confirme su contraseña"
              id="modal-confirm-password"
              name="confirmNewPassword"
              type="password"
              placeholder="Confirme su contraseña"
              value={confirmPassword}
              error={confirmPasswordError}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <ul className="space-y-1 text-sm text-emerald-700">
              <li>• Escriba al menos 8 caracteres</li>
              <li>• Combine letras mayúsculas y minúsculas y al menos un símbolo.</li>
            </ul>
            <p className="text-sm text-gray-600">
              Al hacer clic en &quot;Cambiar contraseña&quot;, acepta nuestros{" "}
              <a href="#terminos" className="text-teal-600 hover:underline">Términos de uso</a> y nuestra{" "}
              <a href="#privacidad" className="text-teal-600 hover:underline">Política de privacidad</a>.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 rounded"
          aria-label="Cerrar"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
