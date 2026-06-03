import { API_ROUTES } from "@/config/apiRoutes";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { createAuthFetch } from "@/Utils/Services/Authenticated/createAuthFetch";

export const artistFetch = createAuthFetch({
  refreshEndpoint: API_ROUTES.artistAuthRefresh,
  clear: () => useArtistAuthStore.getState().clear(),
});
