import { create } from "zustand";

import {
  type AdminIdentity,
  clearStoredAdmin,
  fetchCurrentAdmin,
  readStoredAdmin,
  writeStoredAdmin,
} from "@/Utils/Auth/adminAuthSession";
import { loggerService, LogTag } from "@/Utils/LoggerService";

export type { AdminIdentity };

interface AdminAuthState {
  admin: AdminIdentity | null;
  setAdmin: (admin: AdminIdentity) => void;
  clear: () => void;
  /** Restores the session from the httpOnly cookie via /me on boot. */
  hydrate: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: readStoredAdmin(),
  setAdmin: (admin) => {
    loggerService.info(LogTag.AUTH, "AdminAuthStore: setAdmin");
    writeStoredAdmin(admin);
    set({ admin });
  },
  clear: () => {
    loggerService.info(LogTag.AUTH, "AdminAuthStore: clear");
    clearStoredAdmin();
    set({ admin: null });
  },
  hydrate: async () => {
    const admin = await fetchCurrentAdmin();
    if (admin) {
      writeStoredAdmin(admin);
      set({ admin });
    } else {
      clearStoredAdmin();
      set({ admin: null });
    }
  },
}));
