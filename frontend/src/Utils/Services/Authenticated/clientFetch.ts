import { API_ROUTES } from "@/config/apiRoutes";
import { useClientAuthStore } from "@/stores/ClientAuthStore";
import { createAuthFetch } from "@/Utils/Services/Authenticated/createAuthFetch";

export const clientFetch = createAuthFetch({
  refreshEndpoint: API_ROUTES.accountRefresh,
  getToken: () => useClientAuthStore.getState().token,
  getRefreshToken: () => useClientAuthStore.getState().refreshToken,
  setToken: (tokens) => useClientAuthStore.getState().setToken(tokens),
  clear: () => useClientAuthStore.getState().clear(),
});
