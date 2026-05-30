/**
 * Cliente TrackAid (FastAPI auth). En dev, rutas relativas /api/* pasan por el proxy de Vite.
 */

import { authHeaders } from "./authToken";
import type { RolUsuario } from "./roles";

const getBaseUrl = () =>
  (import.meta.env.VITE_TRACKAID_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string> | any[]; // Añadimos any[] para soportar los errores de validación de Pydantic
}

async function request<T>(
  path: string,
  options: { method?: string; body?: object } & Omit<RequestInit, "body"> = {}
): Promise<{ data?: T; error?: ApiErrorResponse }> {
  const { body, ...rest } = options;
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...authHeaders(),
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
          // FastAPI/Pydantic devuelve los errores de validación en una propiedad "detail", no "details"
          details: (json as { detail?: any }).detail || (json as { details?: Record<string, string> }).details,
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

// --- INTERFAZ ACTUALIZADA ---
export interface RegisterBody {
  nombre: string;
  apellidos: string;
  documentNumber: string; // Requerido para DB
  city?: string;          // Opcional para Locations
  address?: string;       // Opcional para Locations
  email: string;
  companyKey: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface UserResponse {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
  companyId?: string | null;
  companyName?: string | null;
  companyKey?: string | null;
}

export interface AuthSessionResponse {
  success: boolean;
  user: UserResponse;
  accessToken: string;
}

export interface RegisterResponse extends AuthSessionResponse {}

export function register(body: RegisterBody) {
  // Transformamos las llaves del Frontend (camelCase) al formato del Backend (snake_case)
  const payloadBackend = {
    first_name: body.nombre,
    last_name: body.apellidos,
    document_number: body.documentNumber,
    company_id: body.companyKey,
    city: body.city,
    address: body.address,
    email: body.email,
    password: body.password,
  };

  return request<RegisterResponse>("/api/auth/register", { 
    method: "POST", 
    body: payloadBackend 
  });
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthSessionResponse {}

export function login(body: LoginBody) {
  // FastAPI OAuth2PasswordRequestForm suele requerir username en lugar de email,
  // pero si tu endpoint recibe JSON estándar, se envía tal cual:
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

export interface CompanyItem {
  id: string;
  nombre: string;
  llave: string;
  activa: boolean;
  creadaEn?: string | null;
}

export function listCompaniesActivas() {
  return request<{ success: boolean; data: CompanyItem[] }>("/api/companies/activas");
}

export function listCompaniesAll() {
  return request<{ success: boolean; data: CompanyItem[] }>("/api/companies");
}

export function createCompany(body: { nombre: string; llave: string }) {
  return request<{ success: boolean; data: CompanyItem }>("/api/companies", {
    method: "POST",
    body,
  });
}

export function setCompanyActive(companyId: string, activa: boolean) {
  return request<{ success: boolean; data: CompanyItem }>(
    `/api/companies/${companyId}/activa`,
    { method: "PATCH", body: { activa } }
  );
}

export function listAdminUsers() {
  return request<{ success: boolean; data: UserResponse[] }>("/api/admin/usuarios");
}

export function createAdminUser(body: {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
  companyId?: string | null;
}) {
  const payloadBackend = {
    first_name: body.nombre,
    last_name: body.apellidos,
    email: body.email,
    password: body.password,
    rol: body.rol,
    company_id: body.companyId
  };

  return request<{ success: boolean; user: UserResponse }>("/api/admin/usuarios", {
    method: "POST",
    body: payloadBackend,
  });
}

export function updateAdminUserRole(userId: string, rol: string) {
  return request<{ success: boolean; user: UserResponse }>(
    `/api/admin/usuarios/${userId}/rol`,
    { method: "PATCH", body: { rol } }
  );
}

export function updateAdminUserPassword(userId: string, password: string) {
  return request<{ success: boolean; message: string }>(
    `/api/admin/usuarios/${userId}/password`,
    { method: "PATCH", body: { password } }
  );
}

export function assignAdminUserCompany(userId: string, companyId: string) {
  return request<{ success: boolean; user: UserResponse }>(
    `/api/admin/usuarios/${userId}/compania`,
    { method: "PATCH", body: { companyId } }
  );
}

export function setAdminUserActive(userId: string, activa: boolean) {
  return request<{ success: boolean; user: UserResponse }>(
    `/api/admin/usuarios/${userId}/activo`,
    { method: "PATCH", body: { activa } }
  );
}