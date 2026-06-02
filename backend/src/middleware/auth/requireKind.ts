import pool from "@src/db/dbConnect";
import { getAdminById } from "@src/db/query/adminUser/getAdminById.types";
import { getArtistSelfProfile } from "@src/db/query/artist/getArtistSelfProfile.types";
import { getArtistAccountById } from "@src/db/query/artistAccount/getArtistAccountById.types";
import { getClientAccountById } from "@src/db/query/clientAccount/getClientAccountById.types";
import {
  IdentityTokenPayload,
  UserKind,
  verifyIdentityToken,
} from "@src/helpers/auth/identity";
import { AUTH_HEADERS } from "@src/helpers/constants";
import {
  AUTH_ERROR_CODES,
  BOOKING_ERROR_CODES,
} from "@src/helpers/error/constants";
import { ForbiddenError, UnauthorizedError } from "@src/helpers/error/errors";
import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    identity?: IdentityTokenPayload & { displayName?: string };
  }
}

function extractBearer(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith(AUTH_HEADERS.BEARER_PREFIX)) {
    return authHeader.slice(AUTH_HEADERS.BEARER_PREFIX.length);
  }
  const cookie = req.headers.cookie;
  if (cookie && cookie.includes(AUTH_HEADERS.TOKEN_COOKIE_KEY)) {
    return cookie.split(AUTH_HEADERS.TOKEN_COOKIE_KEY)[1].split(";")[0];
  }
  return null;
}

export function requireKind(requiredKind: UserKind): RequestHandler {
  return async (req, _res, next) => {
    try {
      const token = extractBearer(req);
      if (!token) {
        return next(new UnauthorizedError(AUTH_ERROR_CODES.MISSING_TOKEN));
      }

      let payload: IdentityTokenPayload;
      try {
        payload = verifyIdentityToken(token);
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return next(new UnauthorizedError(AUTH_ERROR_CODES.INVALID_TOKEN));
        }
        return next(new UnauthorizedError(AUTH_ERROR_CODES.INVALID_TOKEN));
      }

      if (payload.kind !== requiredKind) {
        return next(new ForbiddenError(AUTH_ERROR_CODES.FORBIDDEN_KIND));
      }

      // Verify the underlying account still exists & is active on every call.
      if (payload.kind === UserKind.ARTIST) {
        const rows = await getArtistAccountById.run(
          { artistId: payload.sub },
          pool,
        );
        if (rows.length === 0 || !rows[0].is_active) {
          return next(new ForbiddenError(AUTH_ERROR_CODES.USER_DISABLED));
        }
        req.identity = { ...payload, displayName: rows[0].stage_name };
      } else if (payload.kind === UserKind.CLIENT) {
        const rows = await getClientAccountById.run(
          { clientId: payload.sub },
          pool,
        );
        if (rows.length === 0 || !rows[0].is_active) {
          return next(new ForbiddenError(AUTH_ERROR_CODES.USER_DISABLED));
        }
        req.identity = {
          ...payload,
          displayName: rows[0].display_name ?? rows[0].email ?? undefined,
        };
      } else {
        const rows = await getAdminById.run({ adminId: payload.sub }, pool);
        if (rows.length === 0 || !rows[0].is_active) {
          return next(new ForbiddenError(AUTH_ERROR_CODES.USER_DISABLED));
        }
        req.identity = { ...payload, displayName: rows[0].full_name };
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export const requireArtist = requireKind(UserKind.ARTIST);
export const requireAdmin = requireKind(UserKind.ADMIN);
export const requireClient = requireKind(UserKind.CLIENT);

/**
 * #4 — gate sensitive artist mutations behind a completed engagement contract.
 * Runs AFTER requireArtist (it relies on req.identity). 403s with a typed code
 * until `onboarding_completed_at` is set by the signed-contract webhook.
 * Read-only / profile / onboarding routes must NOT use this guard.
 */
export const requireOnboardedArtist: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    if (!req.identity) {
      return next(new UnauthorizedError(AUTH_ERROR_CODES.MISSING_TOKEN));
    }
    const rows = await getArtistSelfProfile.run(
      { artistId: req.identity.sub },
      pool,
    );
    if (rows.length === 0 || !rows[0].onboarding_completed_at) {
      return next(new ForbiddenError(BOOKING_ERROR_CODES.ARTIST_NOT_ONBOARDED));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
