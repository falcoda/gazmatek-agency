import { lazy } from "react";

/**
 * Route-level code splitting: every page component is loaded on demand so the
 * initial bundle stays small. Both `I18nRouter` and `MonoRouter` import their
 * page components from here to avoid duplicating the lazy declarations.
 *
 * Layout shells (AppShell, ...) stay eagerly imported in the routers since they
 * are needed to render any route.
 */

export const Home = lazy(() => import("../../pages/Home/Home"));
export const TermsOfUses = lazy(
  () => import("../../pages/TermsOfUses/TermsOfUses"),
);
export const NotFound = lazy(() => import("../../pages/NotFound/NotFound"));
