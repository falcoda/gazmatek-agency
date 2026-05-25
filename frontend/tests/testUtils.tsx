import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /** History stack passed to `MemoryRouter`. Defaults to `["/"]`. */
  initialEntries?: string[];
  /**
   * When provided, the UI is mounted under `<Routes><Route path={routePath}>`,
   * which is required for components reading route params (e.g. `:lang`).
   */
  routePath?: string;
}

/**
 * Renders a component wrapped with the providers every app component may
 * depend on: `react-router` and `react-helmet-async`. i18n works through the
 * global instance initialised in `tests/setupEnv.ts`.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ["/"],
    routePath,
    ...options
  }: RenderWithProvidersOptions = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {routePath ? (
          <Routes>
            <Route path={routePath} element={children} />
          </Routes>
        ) : (
          children
        )}
      </MemoryRouter>
    </HelmetProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
