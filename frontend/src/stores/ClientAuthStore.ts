import { create } from "zustand";

import {
  clearStoredClient,
  type ClientIdentity,
  fetchCurrentClient,
  readStoredClient,
  writeStoredClient,
} from "@/Utils/Auth/clientAuthSession";
import { loggerService, LogTag } from "@/Utils/LoggerService";

export type { ClientIdentity };

interface ClientAuthState {
  client: ClientIdentity | null;
  isAuthenticated: boolean;
  setClient: (client: ClientIdentity) => void;
  clear: () => void;
  /** Restores the session from the httpOnly cookie via /me on boot. */
  hydrate: () => Promise<void>;
}

const initialClient = readStoredClient();

export const useClientAuthStore = create<ClientAuthState>((set) => ({
  client: initialClient,
  isAuthenticated: initialClient !== null,
  setClient: (client) => {
    loggerService.info(LogTag.AUTH, "ClientAuthStore: setClient");
    writeStoredClient(client);
    set({ client, isAuthenticated: true });
  },
  clear: () => {
    loggerService.info(LogTag.AUTH, "ClientAuthStore: clear");
    clearStoredClient();
    set({ client: null, isAuthenticated: false });
  },
  hydrate: async () => {
    const client = await fetchCurrentClient();
    if (client) {
      writeStoredClient(client);
      set({ client, isAuthenticated: true });
    } else {
      clearStoredClient();
      set({ client: null, isAuthenticated: false });
    }
  },
}));
