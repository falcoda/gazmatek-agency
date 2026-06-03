import { API_ROUTES } from "@/config/apiRoutes";
import { AUTH_STORAGE_KEYS } from "@/Utils/Auth/authConstants";

export interface ArtistIdentity {
  id: string;
  email: string;
  stageName: string | null;
  /** Present after login; the /me hydrate endpoint does not return it. */
  slug?: string;
  /** ISO timestamp, or null when onboarding is not finished. */
  onboardingCompletedAt?: string | null;
}

const ARTIST_STORAGE_KEY = AUTH_STORAGE_KEYS.ARTIST;

/**
 * Reads the persisted (non-sensitive) artist identity for optimistic hydration
 * on reload. The auth tokens themselves live in httpOnly cookies, never in
 * JS-readable storage. Returns null when nothing valid is stored.
 */
export function readStoredArtist(): ArtistIdentity | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ARTIST_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const artist = JSON.parse(raw) as ArtistIdentity;

    if (typeof artist.id !== "string" || typeof artist.email !== "string") {
      return null;
    }

    return artist;
  } catch {
    clearStoredArtist();
    return null;
  }
}

/** Persists the non-sensitive artist identity (never tokens). */
export function writeStoredArtist(artist: ArtistIdentity): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ARTIST_STORAGE_KEY, JSON.stringify(artist));
}

/** Removes the persisted artist identity. */
export function clearStoredArtist(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ARTIST_STORAGE_KEY);
}

/**
 * Asks the backend to rotate the token pair using the httpOnly refresh cookie.
 * Returns whether the refresh succeeded.
 */
export async function refreshArtistSession(): Promise<boolean> {
  try {
    const response = await fetch(API_ROUTES.artistAuthRefresh, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
}

/** Resolves the current artist from the access-token cookie via /artist/me. */
async function requestCurrentArtist(): Promise<ArtistIdentity | null> {
  const response = await fetch(API_ROUTES.artistMe, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const artist = (await response.json()) as ArtistIdentity;

  if (typeof artist.id !== "string") {
    return null;
  }

  return artist;
}

/**
 * Resolves the current artist from the httpOnly session cookie, refreshing once
 * if the access token has expired. Returns null when no valid session exists.
 * Used to hydrate the store on boot.
 */
export async function fetchCurrentArtist(): Promise<ArtistIdentity | null> {
  try {
    const artist = await requestCurrentArtist();

    if (artist) {
      return artist;
    }

    const refreshed = await refreshArtistSession();

    return refreshed ? await requestCurrentArtist() : null;
  } catch {
    return null;
  }
}
