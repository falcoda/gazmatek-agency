// Centralized HTTP header values (Rule 4: no magic strings).
//
// Shared `Cache-Control` directive for public, short-lived cacheable GET
// responses (stats, content blocks). Keep a single source so the TTL is tuned
// in one place.
export const PUBLIC_CACHE_CONTROL = "public, max-age=300";
