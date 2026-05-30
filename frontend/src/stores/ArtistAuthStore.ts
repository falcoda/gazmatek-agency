import { create } from "zustand";
import { persist } from "zustand/middleware";

import { loggerService, LogTag } from "@/Utils/LoggerService";

export interface ArtistIdentity {
  id: string;
  email: string;
  slug: string;
  stageName: string;
}

export interface ArtistSessionPayload {
  token: string;
  refreshToken: string;
  artist: ArtistIdentity;
}

interface ArtistAuthState {
  token: string | null;
  refreshToken: string | null;
  artist: ArtistIdentity | null;
  setSession: (s: ArtistSessionPayload) => void;
  setToken: (t: { token: string; refreshToken: string }) => void;
  clear: () => void;
}

export const useArtistAuthStore = create<ArtistAuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      artist: null,
      setSession: ({ token, refreshToken, artist }) => {
        loggerService.info(LogTag.AUTH, "ArtistAuthStore: setSession");
        set({ token, refreshToken, artist });
      },
      setToken: ({ token, refreshToken }) => {
        set({ token, refreshToken });
      },
      clear: () => {
        loggerService.info(LogTag.AUTH, "ArtistAuthStore: clear");
        set({ token: null, refreshToken: null, artist: null });
      },
    }),
    { name: "gazmatek.artistAuth" },
  ),
);
