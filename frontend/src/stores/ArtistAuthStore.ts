import { create } from "zustand";

import {
  type ArtistIdentity,
  clearStoredArtist,
  fetchCurrentArtist,
  readStoredArtist,
  writeStoredArtist,
} from "@/Utils/Auth/artistAuthSession";
import { loggerService, LogTag } from "@/Utils/LoggerService";

export type { ArtistIdentity };

interface ArtistAuthState {
  artist: ArtistIdentity | null;
  setSession: (payload: { artist: ArtistIdentity }) => void;
  clear: () => void;
  /** Restores the session from the httpOnly cookie via /me on boot. */
  hydrate: () => Promise<void>;
}

export const useArtistAuthStore = create<ArtistAuthState>((set) => ({
  artist: readStoredArtist(),
  setSession: ({ artist }) => {
    loggerService.info(LogTag.AUTH, "ArtistAuthStore: setSession");
    writeStoredArtist(artist);
    set({ artist });
  },
  clear: () => {
    loggerService.info(LogTag.AUTH, "ArtistAuthStore: clear");
    clearStoredArtist();
    set({ artist: null });
  },
  hydrate: async () => {
    const artist = await fetchCurrentArtist();
    if (artist) {
      writeStoredArtist(artist);
      set({ artist });
    } else {
      clearStoredArtist();
      set({ artist: null });
    }
  },
}));
