export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
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
