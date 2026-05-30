import toast from "react-hot-toast";

import { loggerService, LogTag } from "@/Utils/LoggerService";
import {
  extractApiErrorMessage,
  parseErrorBody,
} from "@/Utils/Services/Fetch/responseParsing";

export interface AuthFetchOptions extends RequestInit {
  silent?: boolean;
  /**
   * Called when the API returns 401. The implementation may attempt a refresh
   * and return a fresh access token to retry the request once. Return `null` to
   * give up — the original 401 is surfaced.
   */
  onUnauthorized?: () => Promise<string | null>;
  /**
   * Called when the session is definitively considered expired (no refresh
   * possible, or refresh succeeded but the retry was still rejected). The
   * caller should clear its auth store here so that route guards can redirect
   * to the appropriate login page.
   */
  onSessionExpired?: () => void;
}

async function executeFetch<T>(
  route: string,
  token: string | null,
  init: RequestInit,
  silent: boolean | undefined,
): Promise<{ ok: true; data: T | null } | { ok: false; status: number }> {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(route, { ...init, headers });

  if (response.ok) {
    const ct = response.headers.get("content-type") ?? "";
    if (response.status === 204 || !ct.includes("application/json")) {
      return { ok: true, data: null };
    }
    return { ok: true, data: (await response.json()) as T };
  }

  if (response.status === 401) {
    return { ok: false, status: 401 };
  }

  const body = await parseErrorBody(response);
  if (!silent) {
    toast.error(extractApiErrorMessage(body));
  }
  loggerService.error(LogTag.API, "Auth fetch failed", {
    route,
    status: response.status,
    body,
  });
  return { ok: false, status: response.status };
}

export async function identityFetch<T>(
  route: string,
  token: string | null,
  options: AuthFetchOptions = {},
): Promise<T | null> {
  const { silent, onUnauthorized, onSessionExpired, ...init } = options;
  try {
    const first = await executeFetch<T>(route, token, init, silent);
    if (first.ok) return first.data;

    if (first.status === 401 && onUnauthorized) {
      const refreshed = await onUnauthorized();
      if (refreshed) {
        const second = await executeFetch<T>(route, refreshed, init, silent);
        if (second.ok) return second.data;
        if (second.status === 401) {
          onSessionExpired?.();
          if (!silent) toast.error("Session expirée");
        }
        return null;
      }
    }

    if (first.status === 401) {
      onSessionExpired?.();
      if (!silent) toast.error("Session expirée");
    }
    return null;
  } catch (error) {
    loggerService.error(LogTag.API, "Auth fetch network error", error);
    if (!silent) toast.error("Une erreur est survenue");
    return null;
  }
}
