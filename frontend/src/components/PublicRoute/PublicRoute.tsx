import { Navigate, Outlet, useSearchParams } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";

/**
 * Route guard for public-only client routes (account login / signup). Renders
 * the matched child route when the visitor is NOT authenticated as a client,
 * otherwise redirects them to the `next` target (if any) or the account
 * dashboard.
 */
const PublicRoute = () => {
  const language = useOptionalLanguage();
  const client = useClientAuthStore((state) => state.client);
  const [searchParams] = useSearchParams();

  if (client) {
    const next = searchParams.get("next");
    return (
      <Navigate
        to={next ?? getPagePath("accountDashboard", language)}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PublicRoute;
