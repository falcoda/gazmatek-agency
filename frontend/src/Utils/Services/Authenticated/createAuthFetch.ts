import { createTokenRefresher } from "@/Utils/Auth/createTokenRefresher";
import {
  type AuthFetchOptions,
  identityFetch,
} from "@/Utils/Services/Authenticated/identityFetch";

interface RefreshTokens {
  token: string;
  refreshToken: string;
}

export interface AuthFetchConfig {
  /** Endpoint hit to exchange the refresh token for a new access token. */
  refreshEndpoint: string;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  setToken: (tokens: RefreshTokens) => void;
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
    const refreshToken = config.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await fetch(config.refreshEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        config.clear();
        return false;
      }
      const data = (await response.json()) as RefreshTokens;
      config.setToken({ token: data.token, refreshToken: data.refreshToken });
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
    return identityFetch<T>(route, config.getToken(), {
      ...options,
      onUnauthorized: async () =>
        (await tryRefresh()) ? config.getToken() : null,
      onSessionExpired: () => config.clear(),
    });
  };
}
