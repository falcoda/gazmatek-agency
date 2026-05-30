import { create } from "zustand";
import { persist } from "zustand/middleware";

import { loggerService, LogTag } from "@/Utils/LoggerService";

export interface AdminIdentity {
  id: string;
  email: string;
  fullName: string;
}

export interface AdminSessionPayload {
  token: string;
  refreshToken: string;
  admin: AdminIdentity;
}

interface AdminAuthState {
  token: string | null;
  refreshToken: string | null;
  admin: AdminIdentity | null;
  setSession: (s: AdminSessionPayload) => void;
  setToken: (t: { token: string; refreshToken: string }) => void;
  clear: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      admin: null,
      setSession: ({ token, refreshToken, admin }) => {
        loggerService.info(LogTag.AUTH, "AdminAuthStore: setSession");
        set({ token, refreshToken, admin });
      },
      setToken: ({ token, refreshToken }) => {
        set({ token, refreshToken });
      },
      clear: () => {
        loggerService.info(LogTag.AUTH, "AdminAuthStore: clear");
        set({ token: null, refreshToken: null, admin: null });
      },
    }),
    { name: "gazmatek.adminAuth" },
  ),
);
