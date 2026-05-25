import { Navigate, Outlet } from "react-router-dom";

import { PAGES } from "@/config/pages";
import { useAuthStore } from "@/stores/AuthStore";

/**
 * Route guard for public-only routes (login, register, ...). Renders the
 * matched child route when the user is NOT authenticated, otherwise redirects
 * authenticated users away to the main page.
 *
 * NOTE: the template does not ship a login page. The project must implement
 * one and wrap it with this guard in its routers.
 */
const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={PAGES.main} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
