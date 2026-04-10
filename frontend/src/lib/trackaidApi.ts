/**
 * Cliente TrackAid (FastAPI auth). En dev, rutas relativas /api/* pasan por el proxy de Vite.
 */

import type { RolUsuario } from "./roles";

const getBaseUrl = () =>
  (import.meta.env.VITE_TRACKAID_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string>;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: object } & Omit<RequestInit, "body"> = {}
): Promise<{ data?: T; error?: ApiErrorResponse }> {
  const { body, ...rest } = options;
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...rest.headers,
  };
  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: {
          code: (json as { code?: string }).code ?? "INTERNAL_ERROR",
          message: (json as { message?: string }).message ?? "Algo salió mal",
          details: (json as { details?: Record<string, string> }).details,
        },
      };
    }
    return { data: json as T };
  } catch {
    return {
      error: {
        code: "INTERNAL_ERROR",
        message:
          "No se pudo conectar con el servidor. Comprueba que el backend esté en ejecución.",
      },
    };
  }
}

export interface RegisterBody {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface UserResponse {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  /** `webmaster` | `soporte` | `usuario` — en SQLite; actualizado al volver a iniciar sesión. */
  rol: RolUsuario;
}

export interface RegisterResponse {
  success: boolean;
  user: UserResponse;
}

export function register(body: RegisterBody) {
  return request<RegisterResponse>("/api/auth/register", { method: "POST", body });
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: UserResponse;
}

export function login(body: LoginBody) {
  return request<LoginResponse>("/api/auth/login", { method: "POST", body });
}

export interface ForgotPasswordBody {
  email: string;
  confirmEmail: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export function forgotPassword(body: ForgotPasswordBody) {
  return request<ForgotPasswordResponse>("/api/auth/forgot-password", { method: "POST", body });
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export function resetPassword(body: ResetPasswordBody) {
  return request<ResetPasswordResponse>("/api/auth/reset-password", { method: "POST", body });
}
