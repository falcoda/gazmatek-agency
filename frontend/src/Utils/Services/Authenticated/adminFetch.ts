import { API_ROUTES } from "@/config/apiRoutes";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import { createAuthFetch } from "@/Utils/Services/Authenticated/createAuthFetch";

export const adminFetch = createAuthFetch({
  refreshEndpoint: API_ROUTES.adminAuthRefresh,
  getToken: () => useAdminAuthStore.getState().token,
  getRefreshToken: () => useAdminAuthStore.getState().refreshToken,
  setToken: (tokens) => useAdminAuthStore.getState().setToken(tokens),
  clear: () => useAdminAuthStore.getState().clear(),
});
