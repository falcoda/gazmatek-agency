import toast from "react-hot-toast";

import { useAuthStore } from "@/stores/AuthStore";
import { refreshSession } from "@/Utils/Auth/authSession";
import { createTokenRefresher } from "@/Utils/Auth/createTokenRefresher";
import { isAccessTokenExpired } from "@/Utils/Auth/jwt";
import { loggerService, LogTag } from "@/Utils/LoggerService";

// Singleton refresh guard shared across concurrent requests.
const tryRefreshTokens = createTokenRefresher(async () => {
  const { refreshToken, setSession, user } = useAuthStore.getState();

  if (!refreshToken || !user) {
    return false;
  }

  const tokens = await refreshSession(refreshToken);

  if (!tokens) {
    return false;
  }

  setSession({ ...tokens, user });
  return true;
});

/** Builds request headers, attaching the bearer token when available. */
function buildHeaders(accessToken: string | null, base?: HeadersInit): Headers {
  const headers = new Headers(base ?? undefined);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function appFetch(route: string, options?: RequestInit) {
  try {
    const { clearUser } = useAuthStore.getState();

    const handleSessionExpired = () => {
      clearUser();
      return { unauthorized: true };
    };

    // Proactive refresh only when a session exists but the access token is
    // expired (or about to expire within the configured leeway).
    const {
      accessToken: tokenBeforeRequest,
      refreshToken: storedRefreshToken,
    } = useAuthStore.getState();
    if (storedRefreshToken && isAccessTokenExpired(tokenBeforeRequest)) {
      const refreshed = await tryRefreshTokens();
      if (!refreshed) {
        return handleSessionExpired();
      }
    }

    const { accessToken } = useAuthStore.getState();
    const headers = buildHeaders(accessToken, options?.headers);

    const response = await fetch(route, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 429) {
      toast.error("Trop de requêtes, veuillez réessayer plus tard");
      return null;
    }

    // On 401, attempt one refresh + retry before giving up (only if a session
    // exists).
    if (response.status === 401) {
      const { refreshToken: currentRefreshToken } = useAuthStore.getState();
      if (!currentRefreshToken) {
        return handleSessionExpired();
      }

      const refreshed = await tryRefreshTokens();
      if (!refreshed) {
        return handleSessionExpired();
      }

      const { accessToken: newToken } = useAuthStore.getState();
      const retryHeaders = buildHeaders(newToken, options?.headers);
      const retryResponse = await fetch(route, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });

      if (retryResponse.status === 401) {
        return handleSessionExpired();
      }

      if (retryResponse.ok) {
        const retryContentType = retryResponse.headers.get("content-type");
        if (
          retryContentType?.includes("application/pdf") ||
          retryContentType?.includes("text/csv")
        ) {
          return await retryResponse.blob();
        }
        return await retryResponse.json();
      }

      return null;
    }

    const contentType = response.headers.get("content-type");

    if (response.ok) {
      if (
        contentType?.includes("application/pdf") ||
        contentType?.includes("text/csv")
      ) {
        return await response.blob();
      }
      return await response.json();
    }

    const parseResponseData = async () => {
      if (!contentType?.includes("application/json")) return null;
      return await response.json();
    };

    const responseData = await parseResponseData();
    loggerService.error(LogTag.API, "API request failed", {
      route,
      responseData,
      status: response.status,
    });

    const firstDetail =
      Array.isArray(responseData?.details) && responseData.details.length > 0
        ? (responseData.details[0] as { message?: string }).message
        : null;

    if (response.status === 403) {
      toast.error(firstDetail ?? responseData?.message ?? "Accès refusé");
      return { forbidden: true };
    }

    toast.error(
      firstDetail ?? responseData?.message ?? "Une erreur est survenue",
    );
    return null;
  } catch (error) {
    loggerService.error(LogTag.API, "Unexpected fetch error", error);
    toast.error("Une erreur est survenue");
    return null;
  }
}

export { appFetch };
export default appFetch;
