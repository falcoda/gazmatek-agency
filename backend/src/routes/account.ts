import pool from "@src/db/dbConnect";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import { UnauthorizedError } from "@src/helpers/error/errors";
import { validateRequest } from "@src/helpers/validation";
import { requireClient } from "@src/middleware/auth/requireKind";
import { authRateLimiter } from "@src/middleware/security/rateLimit";
import {
  accountBookingCancelBodySchema,
  accountBookingIdParamsSchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from "@src/schemas/clientAuth";
import ClientAuthService from "@src/services/auth/clientAuthService";
import { Router } from "express";

const accountRouter = Router();
const service = new ClientAuthService(pool);

/**
 * @swagger
 * /api/account/register:
 *   post:
 *     summary: Create a client account with email + password
 *     tags:
 *       - Account
 *     responses:
 *       201:
 *         description: Account created, returns access token, refresh token, client identity
 */
accountRouter.post(
  "/register",
  authRateLimiter,
  validateRequest({ body: registerBodySchema }),
  async (req, res, next) => {
    try {
      const body = req.body as {
        email: string;
        password: string;
        displayName: string;
        phone?: string;
        companyName?: string;
        companyNumber?: string;
        vatNumber?: string;
        addressStreet?: string;
        addressNumber?: string;
        addressZip?: string;
        addressCity?: string;
        addressCountry?: string;
      };
      const result = await service.register(body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/account/login:
 *   post:
 *     summary: Log in with email + password
 *     tags:
 *       - Account
 */
accountRouter.post(
  "/login",
  authRateLimiter,
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

/**
 * @swagger
 * /api/account/refresh:
 *   post:
 *     summary: Rotate refresh token and issue a new access token
 *     tags:
 *       - Account
 */
accountRouter.post(
  "/refresh",
  authRateLimiter,
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

/**
 * @swagger
 * /api/account/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags:
 *       - Account
 */
accountRouter.post("/logout", async (req, res, next) => {
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

/**
 * @swagger
 * /api/account/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags:
 *       - Account
 */
accountRouter.post(
  "/forgot-password",
  authRateLimiter,
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

/**
 * @swagger
 * /api/account/reset-password:
 *   post:
 *     summary: Reset the password using a token from the email
 *     tags:
 *       - Account
 */
accountRouter.post(
  "/reset-password",
  authRateLimiter,
  validateRequest({ body: resetPasswordBodySchema }),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body as {
        token: string;
        newPassword: string;
      };
      const result = await service.resetPassword(token, newPassword);
      res.status(HTTP_STATUS.OK).json({ message: "ok", email: result.email });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/account/me:
 *   get:
 *     summary: Return the current client identity
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 */
accountRouter.get("/me", requireClient, async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    id: req.identity?.sub,
    email: req.identity?.data,
    displayName: req.identity?.displayName ?? null,
  });
});

/**
 * @swagger
 * /api/account/bookings:
 *   get:
 *     summary: List the current client's bookings
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 */
accountRouter.get("/bookings", requireClient, async (req, res, next) => {
  try {
    const clientId = req.identity?.sub;
    if (!clientId) {
      throw new UnauthorizedError();
    }
    const bookings = await service.listBookings(clientId);
    res.status(HTTP_STATUS.OK).json({ bookings });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/account/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking owned by the authenticated client
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       404:
 *         description: Booking not found (or not owned by the client)
 *       409:
 *         description: Booking cannot be cancelled (terminal status or too close to event)
 */
accountRouter.post(
  "/bookings/:id/cancel",
  requireClient,
  validateRequest({
    params: accountBookingIdParamsSchema,
    body: accountBookingCancelBodySchema,
  }),
  async (req, res, next) => {
    try {
      const clientId = req.identity?.sub;
      if (!clientId) {
        throw new UnauthorizedError();
      }
      const body = req.body as { reason?: string };
      const result = await service.cancelBooking(
        clientId,
        req.params.id as string,
        body.reason,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default accountRouter;
