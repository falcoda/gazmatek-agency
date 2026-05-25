import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

import { getPagePath, PAGES } from "@/config/pages";
import { isSupportedLanguage } from "@/i18n/routing";
import { useAuthStore } from "@/stores/AuthStore";

/**
 * Route guard for authenticated-only routes. Renders the matched child route
 * when the user is authenticated, otherwise redirects to the login page.
 *
 * NOTE: the template does not ship a login page. The project must implement
 * one and register the `PAGES.login` route in its routers for this guard to
 * work as expected.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const loginPath = isSupportedLanguage(lang)
    ? getPagePath("login", lang)
    : PAGES.login;

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
