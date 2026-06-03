import { API_ROUTES } from "@/config/apiRoutes";
import { AUTH_STORAGE_KEYS } from "@/Utils/Auth/authConstants";

export interface ClientIdentity {
  id: string;
  email: string | null;
  displayName: string | null;
}

const CLIENT_STORAGE_KEY = AUTH_STORAGE_KEYS.CLIENT;

/**
 * Reads the persisted (non-sensitive) client identity for optimistic hydration
 * on reload. The auth tokens themselves live in httpOnly cookies, never in
 * JS-readable storage. A stub/claimed client may have a null email and display
 * name, so only `id` is required to be valid.
 */
export function readStoredClient(): ClientIdentity | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CLIENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const client = JSON.parse(raw) as ClientIdentity;

    if (typeof client.id !== "string") {
      return null;
    }

    return client;
  } catch {
    clearStoredClient();
    return null;
  }
}

/** Persists the non-sensitive client identity (never tokens). */
export function writeStoredClient(client: ClientIdentity): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(client));
}

/** Removes the persisted client identity. */
export function clearStoredClient(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CLIENT_STORAGE_KEY);
}

/**
 * Asks the backend to rotate the token pair using the httpOnly refresh cookie.
 * Returns whether the refresh succeeded.
 */
export async function refreshClientSession(): Promise<boolean> {
  try {
    const response = await fetch(API_ROUTES.accountRefresh, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
}

/** Resolves the current client from the access-token cookie via /account/me. */
async function requestCurrentClient(): Promise<ClientIdentity | null> {
  const response = await fetch(API_ROUTES.accountMe, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const client = (await response.json()) as ClientIdentity;

  if (typeof client.id !== "string") {
    return null;
  }

  return client;
}

/**
 * Resolves the current client from the httpOnly session cookie, refreshing once
 * if the access token has expired. Returns null when no valid session exists.
 * Used to hydrate the store on boot.
 */
export async function fetchCurrentClient(): Promise<ClientIdentity | null> {
  try {
    const client = await requestCurrentClient();

    if (client) {
      return client;
    }

    const refreshed = await refreshClientSession();

    return refreshed ? await requestCurrentClient() : null;
  } catch {
    return null;
  }
}
