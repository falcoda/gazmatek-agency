import { API_ROUTES } from "@/config/apiRoutes";
import { AUTH_STORAGE_KEYS } from "@/Utils/Auth/authConstants";

export interface AuthUser {
  email: string;
  id: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const AUTH_SESSION_STORAGE_KEY = AUTH_STORAGE_KEYS.USER_SESSION;

/**
 * Reads the persisted auth session from localStorage.
 * Returns null when no session is stored or the stored value is invalid.
 */
export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;

    if (!session.accessToken || !session.refreshToken || !session.user) {
      return null;
    }

    // Return session even if the access token is expired — appFetch refreshes
    // proactively. Only discard when the session structure is invalid.
    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

/** Persists the auth session to localStorage. */
export function writeAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

/** Removes the persisted auth session from localStorage. */
export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

/**
 * Exchanges a refresh token for a fresh token pair via the backend refresh
 * endpoint. Returns null when the refresh request fails or is rejected.
 */
export async function refreshSession(
  currentRefreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(API_ROUTES.authRefresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };
  } catch {
    return null;
  }
}
