import { AuthenticatedUser } from "@src/types/requestTypes";

interface CacheEntry {
  user: AuthenticatedUser;
  expiresAt: number;
}

// #54 — Scope note: this cache is used ONLY by the legacy template JWT strategy
// (src/middleware/auth/strategies/jwt.ts, backed by the template `users` table).
// The application's real identity auth (admin/artist/client, via
// middleware/auth/requireKind.ts) does NOT use this cache and re-validates
// is_active against the DB on every request. The template `users` table has no
// is_active column, so there is nothing to re-validate on a cache hit; a deleted
// user keeps access for at most TTL_MS on this legacy path only.
//
// Short TTL: trades a tiny staleness window for removing one DB round-trip from
// every legacy-authenticated request.
const TTL_MS = 30_000;

// Cheap upper bound on memory: the cache is dropped wholesale when it grows
// past this, instead of tracking per-entry LRU. Entries are short-lived anyway.
const MAX_ENTRIES = 5_000;

const cache = new Map<string, CacheEntry>();

/** Returns the cached authenticated user for an email, or null when stale. */
export const getCachedAuthUser = (email: string): AuthenticatedUser | null => {
  const entry = cache.get(email);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(email);
    return null;
  }

  return entry.user;
};

/** Stores an authenticated user keyed by email for a short TTL. */
export const setCachedAuthUser = (
  email: string,
  user: AuthenticatedUser,
): void => {
  if (cache.size >= MAX_ENTRIES) {
    cache.clear();
  }

  cache.set(email, { user, expiresAt: Date.now() + TTL_MS });
};

/** Clears the whole cache. Used by tests and after user mutations. */
export const clearAuthUserCache = (): void => {
  cache.clear();
};
