import { config } from "@src/helpers/config";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import {
  ExpiredTokenError,
  UnauthorizedError,
} from "@src/helpers/error/errors";
import { authenticateWithApiKey } from "@src/middleware/auth/strategies/apiKey";
import { authenticateWithJwt } from "@src/middleware/auth/strategies/jwt";
import { AUTH_STRATEGY } from "@src/types/config";
import { RequestHandler } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Pool } from "pg";

export const authenticate = (client: Pool): RequestHandler => {
  return async (req, _res, next) => {
    try {
      for (const strategy of config.auth.strategies) {
        const user =
          strategy === AUTH_STRATEGY.API_KEY
            ? await authenticateWithApiKey(req, client)
            : await authenticateWithJwt(req, client);

        if (!user) {
          continue;
        }

        req.user = user;

        const normalizedUserId = Number(user.id);

        if (!Number.isNaN(normalizedUserId)) {
          req.user_id = normalizedUserId;
        }

        if (user.email) {
          req.email = user.email;
        }
        next();
        return;
      }

      next(new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED));
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        next(new ExpiredTokenError());
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        next(new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED));
        return;
      }

      next(error);
    }
  };
};
