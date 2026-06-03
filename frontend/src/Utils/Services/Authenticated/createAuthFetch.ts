import { createTokenRefresher } from "@/Utils/Auth/createTokenRefresher";
import {
  type AuthFetchOptions,
  identityFetch,
} from "@/Utils/Services/Authenticated/identityFetch";

export interface AuthFetchConfig {
  /**
   * Endpoint hit to rotate the session using the httpOnly refresh cookie. The
   * server re-sets the access/refresh cookies; nothing is read in JS.
   */
  refreshEndpoint: string;
  /** Clears the cached identity so route guards redirect to login. */
  clear: () => void;
}

/**
 * Options a caller may pass to an authenticated fetch wrapper. The refresh and
 * session-expiry callbacks are owned by the wrapper, but `onError` stays open so
 * callers can map typed backend error codes to UI messages.
 */
export type AuthFetchCallerOptions = Omit<
  AuthFetchOptions,
  "onUnauthorized" | "onSessionExpired"
>;

/**
 * Call signature shared by every authenticated fetch wrapper. Callers keep the
 * generic so `authFetch<MyResponse>(route)` stays fully typed.
 */
export type AuthFetch = <T>(
  route: string,
  options?: AuthFetchCallerOptions,
) => Promise<T | null>;

/**
 * Builds an authenticated fetch wrapper for one auth domain (client / artist /
 * admin). Refresh-on-401-then-retry, the single-flight refresh guard and the
 * "clear store on definitive expiry" behaviour are implemented once here; each
 * domain only supplies its endpoint and store accessors.
 */
export function createAuthFetch(config: AuthFetchConfig): AuthFetch {
  const tryRefresh = createTokenRefresher(async () => {
    try {
      const response = await fetch(config.refreshEndpoint, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        config.clear();
        return false;
      }
      return true;
    } catch {
      config.clear();
      return false;
    }
  });

  return function authFetch<T>(
    route: string,
    options: AuthFetchCallerOptions = {},
  ): Promise<T | null> {
    return identityFetch<T>(route, {
      ...options,
      onUnauthorized: () => tryRefresh(),
      onSessionExpired: () => config.clear(),
    });
  };
}
