import pool from "@src/db/dbConnect";
import {
  ARTIST_REFRESH_COOKIE_PATH,
  clearAuthCookies,
  setAuthCookies,
} from "@src/helpers/authCookies";
import { AUTH_COOKIES } from "@src/helpers/constants";
import { AUTH_ERROR_CODES, HTTP_STATUS } from "@src/helpers/error/constants";
import { UnauthorizedError } from "@src/helpers/error/errors";
import { validateRequest } from "@src/helpers/validation";
import {
  authAccountRateLimiter,
  authRateLimiter,
} from "@src/middleware/security/rateLimit";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  resetPasswordBodySchema,
} from "@src/schemas/artistAuth";
import ArtistAuthService from "@src/services/auth/artistAuthService";
import { Router } from "express";

const artistAuthRouter = Router();
artistAuthRouter.use(authRateLimiter);

const service = new ArtistAuthService(pool);

artistAuthRouter.post(
  "/login",
  authAccountRateLimiter,
  validateRequest({ body: loginBodySchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const { token, refreshToken, artist } = await service.login(
        email,
        password,
      );
      setAuthCookies(res, AUTH_COOKIES.ARTIST, ARTIST_REFRESH_COOKIE_PATH, {
        accessToken: token,
        refreshToken,
      });
      res.status(HTTP_STATUS.OK).json({ artist });
    } catch (error) {
      next(error);
    }
  },
);

artistAuthRouter.post(
  "/forgot-password",
  authAccountRateLimiter,
  validateRequest({ body: forgotPasswordBodySchema }),
  async (req, res, next) => {
    try {
      const body = req.body as { email: string; locale: "fr" | "nl" | "en" };
      await service.forgotPassword(body.email, body.locale);
      res.status(HTTP_STATUS.OK).json({ message: "ok" });
    } catch (error) {
      next(error);
    }
  },
);

artistAuthRouter.post(
  "/reset-password",
  validateRequest({ body: resetPasswordBodySchema }),
  async (req, res, next) => {
    try {
      const body = req.body as { token: string; newPassword: string };
      await service.resetPassword(body.token, body.newPassword);
      res.status(HTTP_STATUS.OK).json({ message: "ok" });
    } catch (error) {
      next(error);
    }
  },
);

// Reads the refresh token from the httpOnly artist_refresh_token cookie, rotates
// it, and re-sets both cookies.
artistAuthRouter.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[AUTH_COOKIES.ARTIST.REFRESH];
    if (!refreshToken) {
      throw new UnauthorizedError(AUTH_ERROR_CODES.INVALID_TOKEN);
    }
    const {
      token,
      refreshToken: rotated,
      artist,
    } = await service.refresh(refreshToken);
    setAuthCookies(res, AUTH_COOKIES.ARTIST, ARTIST_REFRESH_COOKIE_PATH, {
      accessToken: token,
      refreshToken: rotated,
    });
    res.status(HTTP_STATUS.OK).json({ artist });
  } catch (error) {
    next(error);
  }
});

// Revokes the refresh token (from its cookie) and clears both auth cookies.
artistAuthRouter.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[AUTH_COOKIES.ARTIST.REFRESH];
    if (refreshToken) {
      await service.logout(refreshToken);
    }
    clearAuthCookies(res, AUTH_COOKIES.ARTIST, ARTIST_REFRESH_COOKIE_PATH);
    res.status(HTTP_STATUS.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
});

export default artistAuthRouter;
