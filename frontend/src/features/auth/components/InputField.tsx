
import { useState } from "react";

type InputFieldProps = {
  label: string;
  id: string;
  name?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InputField({
  label,
  id,
  name,
  type = "text",
  placeholder,
  required,
  error,
  className = "",
  defaultValue,
  value,
  autoComplete,
  onChange,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-850 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={inputType}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          className={`
            w-full px-4 py-3 rounded-lg border border-gray-300
            bg-white text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary
            focus:bg-white focus:text-gray-900
            disabled:bg-gray-50 disabled:text-gray-500
            transition-colors
            ${isPassword ? "pr-12" : ""}
            ${error ? "border-red-500" : ""}
            ${className}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
