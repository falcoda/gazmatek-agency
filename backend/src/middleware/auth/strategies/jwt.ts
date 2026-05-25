import { getUserByEmail } from "@src/db/query/auth/getUserByEmail.types";
import { config } from "@src/helpers/config";
import { AUTH_HEADERS } from "@src/helpers/constants";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import { UnauthorizedError } from "@src/helpers/error/errors";
import {
  getCachedAuthUser,
  setCachedAuthUser,
} from "@src/middleware/auth/authUserCache";
import { AUTH_STRATEGY } from "@src/types/config";
import { AuthenticatedUser, AuthTokenPayload } from "@src/types/requestTypes";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const extractBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith(AUTH_HEADERS.BEARER_PREFIX)) {
    return authHeader.slice(AUTH_HEADERS.BEARER_PREFIX.length);
  }

  const cookie = req.headers.cookie;
  if (cookie && cookie.includes(AUTH_HEADERS.TOKEN_COOKIE_KEY)) {
    return cookie.split(AUTH_HEADERS.TOKEN_COOKIE_KEY)[1].split(";")[0];
  }

  return null;
};

export const authenticateWithJwt = async (
  req: Request,
  client: Pool,
): Promise<AuthenticatedUser | null> => {
  const token = extractBearerToken(req);

  if (!token) {
    return null;
  }

  const payload = jwt.verify(token, config.jwt.key);

  if (typeof payload === "string" || !("data" in payload)) {
    throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const { data: userEmail } = payload as AuthTokenPayload;

  // The token signature/expiry is still verified above on every request;
  // only the user lookup is cached, so this cannot extend a token's lifetime.
  const cachedUser = getCachedAuthUser(userEmail);

  if (cachedUser) {
    return cachedUser;
  }

  const rows = await getUserByEmail.run({ email: userEmail }, client);

  if (rows.length === 0) {
    throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const user = rows[0];

  const authenticatedUser: AuthenticatedUser = {
    id: user.user_id,
    email: user.email,
    authType: AUTH_STRATEGY.JWT,
  };

  setCachedAuthUser(userEmail, authenticatedUser);

  return authenticatedUser;
};
