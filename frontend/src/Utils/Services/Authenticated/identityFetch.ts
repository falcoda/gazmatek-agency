import toast from "react-hot-toast";

import { AUTH_ERROR_CODES } from "@/config/errorCodes";
import { HTTP_STATUS } from "@/config/httpStatus";
import i18n from "@/i18n/i18n";
import { loggerService, LogTag } from "@/Utils/LoggerService";
import {
  type ApiErrorBody,
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
  /**
   * Called for non-session request failures (e.g. 400/404/409) with the HTTP
   * status and parsed error body, letting callers map typed backend error
   * codes to field-level messages. Not invoked for 401/USER_DISABLED, which are
   * handled as session events. Pass `silent: true` to suppress the default
   * toast and handle errors entirely via this callback.
   */
  onError?: (status: number, body: ApiErrorBody | null) => void;
}

/**
 * True when a `403` body carries the USER_DISABLED auth code, meaning the
 * account was deactivated server-side and the local session is stale.
 */
function isUserDisabled(status: number, body: ApiErrorBody | null): boolean {
  return (
    status === HTTP_STATUS.FORBIDDEN &&
    body?.message === AUTH_ERROR_CODES.USER_DISABLED
  );
}

async function executeFetch<T>(
  route: string,
  token: string | null,
  init: RequestInit,
  silent: boolean | undefined,
): Promise<
  | { ok: true; data: T | null }
  | { ok: false; status: number; disabled: boolean; body: ApiErrorBody | null }
> {
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
    if (
      response.status === HTTP_STATUS.NO_CONTENT ||
      !ct.includes("application/json")
    ) {
      return { ok: true, data: null };
    }
    return { ok: true, data: (await response.json()) as T };
  }

  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    return {
      ok: false,
      status: HTTP_STATUS.UNAUTHORIZED,
      disabled: false,
      body: null,
    };
  }

  const body = await parseErrorBody(response);
  const disabled = isUserDisabled(response.status, body);
  // A disabled account is a definitive session event, not a per-request error:
  // skip the generic toast and let the caller clear the session instead. (#18)
  if (!silent && !disabled) {
    toast.error(extractApiErrorMessage(body));
  }
  loggerService.error(LogTag.API, "Auth fetch failed", {
    route,
    status: response.status,
    body,
  });
  return { ok: false, status: response.status, disabled, body };
}

export async function identityFetch<T>(
  route: string,
  token: string | null,
  options: AuthFetchOptions = {},
): Promise<T | null> {
  const { silent, onUnauthorized, onSessionExpired, onError, ...init } =
    options;
  const expireSession = () => {
    onSessionExpired?.();
    if (!silent) toast.error(i18n.t("auth.sessionExpired"));
  };
  try {
    const first = await executeFetch<T>(route, token, init, silent);
    if (first.ok) return first.data;

    // A deactivated account is a definitive session event regardless of the
    // status code: clear the session so route guards redirect to login. (#18)
    if (first.disabled) {
      expireSession();
      return null;
    }

    if (first.status === HTTP_STATUS.UNAUTHORIZED && onUnauthorized) {
      const refreshed = await onUnauthorized();
      if (refreshed) {
        const second = await executeFetch<T>(route, refreshed, init, silent);
        if (second.ok) return second.data;
        if (second.disabled || second.status === HTTP_STATUS.UNAUTHORIZED) {
          expireSession();
        } else {
          onError?.(second.status, second.body);
        }
        return null;
      }
    }

    if (first.status === HTTP_STATUS.UNAUTHORIZED) {
      expireSession();
    } else {
      onError?.(first.status, first.body);
    }
    return null;
  } catch (error) {
    loggerService.error(LogTag.API, "Auth fetch network error", error);
    if (!silent) toast.error(i18n.t("common.error"));
    return null;
  }
}
