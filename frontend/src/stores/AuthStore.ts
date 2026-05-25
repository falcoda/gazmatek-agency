import { create } from "zustand";

import type { AuthSession } from "@/Utils/Auth/authSession";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/Utils/Auth/authSession";
import { loggerService, LogTag } from "@/Utils/LoggerService";

export interface User {
  id: number;

  email: string;
}

interface AuthState {
  user: User | null;

  accessToken: string | null;

  refreshToken: string | null;

  isAuthenticated: boolean;

  /** Sets the authenticated user and persists the full session to storage. */
  setSession: (session: AuthSession) => void;

  /** Sets only the user (no tokens). Kept for backward compatibility. */
  setUser: (user: User) => void;

  /** Clears the user, the tokens, and the persisted session. */
  clearUser: () => void;
}

const storedSession = readAuthSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedSession?.user ?? null,

  accessToken: storedSession?.accessToken ?? null,

  refreshToken: storedSession?.refreshToken ?? null,

  isAuthenticated: Boolean(storedSession),

  setSession: (session) => {
    loggerService.info(LogTag.AUTH, "User authenticated", session.user.email);

    writeAuthSession(session);

    set({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    loggerService.info(LogTag.AUTH, "User authenticated", user.email);

    set({ user, isAuthenticated: true });
  },

  clearUser: () => {
    loggerService.info(LogTag.AUTH, "User logged out");

    clearAuthSession();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
