import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserResponse } from "@/lib/trackaidApi";
import { login as apiLogin } from "@/lib/trackaidApi";
import { normalizarRol } from "@/lib/roles";

const STORAGE_KEY = "trackaid_auth_user";
/** Si cambia, se invalida localStorage y hay que volver a iniciar sesión (evita rol obsoleto o sin campo `rol`). */
const AUTH_STORE_VERSION = 2;

function readStoredUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserResponse & { v?: number };
    if (parsed.v !== AUTH_STORE_VERSION || !parsed?.email || !parsed?.id) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (parsed.rol === undefined || parsed.rol === null || String(parsed.rol).trim() === "") {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const { v: _v, ...fields } = parsed as UserResponse & { v: number };
    return { ...fields, rol: normalizarRol(fields.rol as string) };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

type SyncResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = {
  user: UserResponse | null;
  setUser: (u: UserResponse | null) => void;
  logout: () => void;
  /** Tras cambiar `rol` (u otros datos) en SQLite, vuelve a autenticar y actualiza localStorage. */
  syncUserFromServer: (password: string) => Promise<SyncResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(readStoredUser);

  const setUser = useCallback((u: UserResponse | null) => {
    if (u) {
      const normalized: UserResponse = {
        ...u,
        rol: normalizarRol(u.rol as string | undefined),
      };
      setUserState(normalized);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...normalized, v: AUTH_STORE_VERSION })
      );
    } else {
      setUserState(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const syncUserFromServer = useCallback(
    async (password: string): Promise<SyncResult> => {
      const email = user?.email?.trim();
      if (!email) return { ok: false, message: "No hay sesión activa." };
      const { data, error } = await apiLogin({ email, password });
      if (error) {
        return { ok: false, message: error.message ?? "No se pudo sincronizar." };
      }
      if (data?.success && data.user) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, message: "Respuesta inesperada del servidor." };
    },
    [user?.email, setUser]
  );

  const value = useMemo(
    () => ({ user, setUser, logout, syncUserFromServer }),
    [user, setUser, logout, syncUserFromServer]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
