import { useEffect } from "react";
import { useThemeStore } from "../stores/ThemeStore";

// Re-export the zustand hook itself for convenience
export { useThemeStore } from "../stores/ThemeStore";

// Side-effect hook to ensure theme init + body class applied on mount
export function useInitTheme() {
  const init = useThemeStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
}

// Convenience hook to get current mode directly
export function useThemeMode() {
  return useThemeStore((s) => s.mode);
}
