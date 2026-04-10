import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "trackaid_panel_theme";

export type PanelColorMode = "light" | "dark";

function readStoredTheme(): PanelColorMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* ignore */
  }
  return "dark";
}

type Ctx = {
  mode: PanelColorMode;
  setMode: (m: PanelColorMode) => void;
  toggleMode: () => void;
};

const PanelThemeContext = createContext<Ctx | null>(null);

export function PanelThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PanelColorMode>(() => readStoredTheme());

  const setMode = useCallback((m: PanelColorMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, setMode, toggleMode]);

  return <PanelThemeContext.Provider value={value}>{children}</PanelThemeContext.Provider>;
}

export function usePanelTheme(): Ctx {
  const ctx = useContext(PanelThemeContext);
  if (!ctx) throw new Error("usePanelTheme debe usarse dentro de PanelThemeProvider");
  return ctx;
}
