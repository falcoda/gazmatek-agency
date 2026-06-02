import pool from "@src/db/dbConnect";
import { HTTP_STATUS } from "@src/helpers/error/constants";
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
import { refreshBodySchema } from "@src/schemas/clientAuth";
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
      const result = await service.login(email, password);
      res.status(HTTP_STATUS.OK).json(result);
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

artistAuthRouter.post(
  "/refresh",
  validateRequest({ body: refreshBodySchema }),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await service.refresh(refreshToken);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

artistAuthRouter.post("/logout", async (req, res, next) => {
  try {
    const body = req.body as { refreshToken?: string } | undefined;
    if (body?.refreshToken) {
      await service.logout(body.refreshToken);
    }
    res.status(HTTP_STATUS.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
});

export default artistAuthRouter;
