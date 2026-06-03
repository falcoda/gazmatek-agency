import { API_ROUTES } from "@/config/apiRoutes";
import { AUTH_STORAGE_KEYS } from "@/Utils/Auth/authConstants";

export interface AdminIdentity {
  id: string;
  email: string;
  fullName: string;
}

const ADMIN_STORAGE_KEY = AUTH_STORAGE_KEYS.ADMIN;

/**
 * Reads the persisted (non-sensitive) admin identity for optimistic hydration
 * on reload. The auth tokens themselves live in httpOnly cookies, never in
 * JS-readable storage. Returns null when nothing valid is stored.
 */
export function readStoredAdmin(): AdminIdentity | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const admin = JSON.parse(raw) as AdminIdentity;

    if (typeof admin.id !== "string" || typeof admin.email !== "string") {
      return null;
    }

    return admin;
  } catch {
    clearStoredAdmin();
    return null;
  }
}

/** Persists the non-sensitive admin identity (never tokens). */
export function writeStoredAdmin(admin: AdminIdentity): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

/** Removes the persisted admin identity. */
export function clearStoredAdmin(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
}

/**
 * Asks the backend to rotate the token pair using the httpOnly refresh cookie.
 * The server re-sets the cookies; nothing is read or stored in JS. Returns
 * whether the refresh succeeded.
 */
export async function refreshAdminSession(): Promise<boolean> {
  try {
    const response = await fetch(API_ROUTES.adminAuthRefresh, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
}

/** Resolves the current admin from the access-token cookie via /admin/auth/me. */
async function requestCurrentAdmin(): Promise<AdminIdentity | null> {
  const response = await fetch(API_ROUTES.adminAuthMe, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const admin = (await response.json()) as AdminIdentity;

  if (typeof admin.id !== "string") {
    return null;
  }

  return admin;
}

/**
 * Resolves the current admin from the httpOnly session cookie. If the access
 * token has expired, transparently refreshes once and retries. Returns null
 * when no valid session exists. Used to hydrate the store on boot.
 */
export async function fetchCurrentAdmin(): Promise<AdminIdentity | null> {
  try {
    const admin = await requestCurrentAdmin();

    if (admin) {
      return admin;
    }

    const refreshed = await refreshAdminSession();

    return refreshed ? await requestCurrentAdmin() : null;
  } catch {
    return null;
  }
}
