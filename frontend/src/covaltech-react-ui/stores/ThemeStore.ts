import { create } from "zustand";

export type ThemeMode = "light" | "dark";

export interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  initialized: boolean;
  init: () => void;
}

export const THEME_STORAGE_KEY = "mcn-theme-mode";

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  initialized: false,
  init: () => {
    if (get().initialized) return;
    let stored: ThemeMode | null = null;
    try {
      stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || null;
    } catch {
      /* ignore */
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const mode: ThemeMode = stored || (prefersDark ? "dark" : "light");
    set({ mode, initialized: true });
    applyThemeClass(mode);
  },
  setMode: (m) => {
    set({ mode: m });
    applyThemeClass(m);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  },
  toggle: () => {
    const next: ThemeMode = get().mode === "dark" ? "light" : "dark";
    get().setMode(next);
  },
}));

export function applyThemeClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const cls = "theme-dark";
  if (mode === "dark") document.body.classList.add(cls);
  else document.body.classList.remove(cls);
}
