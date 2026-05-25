import { TOKEN_EXPIRY_LEEWAY_SECONDS } from "@/Utils/Auth/authConstants";

interface JwtPayload {
  exp?: number;
}

/**
 * Decodes the payload segment of a JWT without verifying its signature.
 * Returns null when the token is malformed.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(window.atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true when the access token is missing or close enough to its
 * expiry (within the leeway) that it should be refreshed before use.
 */
export function isAccessTokenExpired(
  token: string | null | undefined,
  leewaySeconds: number = TOKEN_EXPIRY_LEEWAY_SECONDS,
): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  return payload.exp <= nowInSeconds + leewaySeconds;
}
