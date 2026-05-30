import { create } from "zustand";
import { persist } from "zustand/middleware";

import { loggerService, LogTag } from "@/Utils/LoggerService";

export interface ClientIdentity {
  id: string;
  email: string | null;
  displayName: string | null;
}

export interface ClientSessionPayload {
  token: string;
  refreshToken: string;
  client: ClientIdentity;
}

interface ClientAuthState {
  token: string | null;
  refreshToken: string | null;
  client: ClientIdentity | null;
  setSession: (s: ClientSessionPayload) => void;
  setToken: (t: { token: string; refreshToken: string }) => void;
  clear: () => void;
}

export const useClientAuthStore = create<ClientAuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      client: null,
      setSession: ({ token, refreshToken, client }) => {
        loggerService.info(LogTag.AUTH, "ClientAuthStore: setSession");
        set({ token, refreshToken, client });
      },
      setToken: ({ token, refreshToken }) => {
        set({ token, refreshToken });
      },
      clear: () => {
        loggerService.info(LogTag.AUTH, "ClientAuthStore: clear");
        set({ token: null, refreshToken: null, client: null });
      },
    }),
    { name: "gazmatek.clientAuth" },
  ),
);
