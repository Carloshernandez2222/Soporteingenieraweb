import { authHeaders } from "@/lib/authToken";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    ...authHeaders(),
    ...(init?.headers ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      if (!res.ok) throw new Error(`Error HTTP ${res.status}: respuesta no JSON`);
      throw new Error("La respuesta del servidor no es JSON válido.");
    }
  }
  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : `Error HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : "Error desconocido";
}
