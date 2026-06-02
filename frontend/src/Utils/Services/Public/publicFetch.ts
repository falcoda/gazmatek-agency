import toast from "react-hot-toast";

import { HTTP_STATUS } from "@/config/httpStatus";
import { loggerService, LogTag } from "@/Utils/LoggerService";
import {
  extractApiErrorMessage,
  parseErrorBody,
} from "@/Utils/Services/Fetch/responseParsing";

interface PublicFetchOptions extends RequestInit {
  silent?: boolean;
}

/**
 * Fetch wrapper for unauthenticated public endpoints (no auth refresh logic).
 * Returns parsed JSON or null on failure. Surfaces a toast for non-silent errors.
 */
export async function publicFetch<T>(
  route: string,
  options: PublicFetchOptions = {},
): Promise<T | null> {
  const { silent, ...init } = options;
  try {
    const response = await fetch(route, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (
        response.status === HTTP_STATUS.NO_CONTENT ||
        !contentType.includes("application/json")
      ) {
        return null;
      }
      return (await response.json()) as T;
    }

    const errorBody = await parseErrorBody(response);

    loggerService.error(LogTag.API, "Public API request failed", {
      route,
      status: response.status,
      body: errorBody,
    });

    if (!silent) {
      toast.error(extractApiErrorMessage(errorBody));
    }
    return null;
  } catch (error) {
    loggerService.error(LogTag.API, "Public fetch network error", error);
    if (!silent) {
      toast.error("Une erreur est survenue");
    }
    return null;
  }
}

/**
 * Like {@link publicFetch} but reports only whether the request succeeded.
 * Useful for fire-and-forget endpoints (e.g. logout) that return `204 No
 * Content`, where a `null` body cannot distinguish success from failure.
 */
export async function publicFetchOk(
  route: string,
  options: RequestInit = {},
): Promise<boolean> {
  const init = options;
  try {
    const response = await fetch(route, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok) {
      const errorBody = await parseErrorBody(response);
      loggerService.warn(LogTag.API, "Public API request failed", {
        route,
        status: response.status,
        body: errorBody,
      });
    }
    return response.ok;
  } catch (error) {
    loggerService.warn(LogTag.API, "Public fetch network error", error);
    return false;
  }
}
