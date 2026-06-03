import { config } from "@src/helpers/config";
import { API_PREFIX, IDENTITY_TOKEN_EXPIRES } from "@src/helpers/constants";
import { CookieOptions, Response } from "express";

interface ActorCookieNames {
  ACCESS: string;
  REFRESH: string;
}

// Both derive from IDENTITY_TOKEN_EXPIRES so the cookie lifetimes can never
// drift from the identity token / refresh-token lifetimes.
const ACCESS_COOKIE_MAX_AGE_MS =
  IDENTITY_TOKEN_EXPIRES.ACCESS_MINUTES * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS =
  IDENTITY_TOKEN_EXPIRES.REFRESH_DAYS * 24 * 60 * 60 * 1000;

// Refresh cookies are scoped to each actor's auth routes so they are sent only
// on that actor's refresh/logout. Admin and artist have a dedicated `/auth`
// sub-prefix; the client has no such sub-prefix, so its refresh cookie is scoped
// to the whole `/api/account` area (sent on every client request — acceptable).
export const ADMIN_REFRESH_COOKIE_PATH = `${API_PREFIX}/admin/auth`;
export const ARTIST_REFRESH_COOKIE_PATH = `${API_PREFIX}/artist/auth`;
export const CLIENT_REFRESH_COOKIE_PATH = `${API_PREFIX}/account`;

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.auth.cookie.secure,
    sameSite: config.auth.cookie.sameSite,
    domain: config.auth.cookie.domain,
  };
}

/**
 * Sets the httpOnly access + refresh token cookies for one identity actor. The
 * access + refresh token system is unchanged — these cookies are simply how the
 * browser transports the tokens instead of a JSON body / localStorage.
 */
export function setAuthCookies(
  res: Response,
  names: ActorCookieNames,
  refreshPath: string,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie(names.ACCESS, tokens.accessToken, {
    ...baseCookieOptions(),
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE_MS,
  });

  res.cookie(names.REFRESH, tokens.refreshToken, {
    ...baseCookieOptions(),
    path: refreshPath,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

/** Clears an actor's auth cookies (logout). Attributes mirror those used to set them. */
export function clearAuthCookies(
  res: Response,
  names: ActorCookieNames,
  refreshPath: string,
): void {
  res.clearCookie(names.ACCESS, { ...baseCookieOptions(), path: "/" });
  res.clearCookie(names.REFRESH, { ...baseCookieOptions(), path: refreshPath });
}
