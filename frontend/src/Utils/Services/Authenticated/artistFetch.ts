import { API_ROUTES } from "@/config/apiRoutes";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { createAuthFetch } from "@/Utils/Services/Authenticated/createAuthFetch";

export const artistFetch = createAuthFetch({
  refreshEndpoint: API_ROUTES.artistAuthRefresh,
  getToken: () => useArtistAuthStore.getState().token,
  getRefreshToken: () => useArtistAuthStore.getState().refreshToken,
  setToken: (tokens) => useArtistAuthStore.getState().setToken(tokens),
  clear: () => useArtistAuthStore.getState().clear(),
});
