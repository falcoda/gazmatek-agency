import pool from "@src/db/dbConnect";
import {
  clearAuthCookies,
  CLIENT_REFRESH_COOKIE_PATH,
  setAuthCookies,
} from "@src/helpers/authCookies";
import { AUTH_COOKIES } from "@src/helpers/constants";
import { AUTH_ERROR_CODES, HTTP_STATUS } from "@src/helpers/error/constants";
import { UnauthorizedError } from "@src/helpers/error/errors";
import { validateRequest } from "@src/helpers/validation";
import { requireClient } from "@src/middleware/auth/requireKind";
import {
  authAccountRateLimiter,
  authRateLimiter,
} from "@src/middleware/security/rateLimit";
import {
  accountBookingCancelBodySchema,
  accountBookingEditBodySchema,
  accountBookingIdParamsSchema,
  forgotPasswordBodySchema,
  loginBodySchema,
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
      setAuthCookies(res, AUTH_COOKIES.CLIENT, CLIENT_REFRESH_COOKIE_PATH, {
        accessToken: result.token,
        refreshToken: result.refreshToken,
      });
      res.status(HTTP_STATUS.CREATED).json({ client: result.client });
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
  authAccountRateLimiter,
  validateRequest({ body: loginBodySchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const result = await service.login(email, password);
      setAuthCookies(res, AUTH_COOKIES.CLIENT, CLIENT_REFRESH_COOKIE_PATH, {
        accessToken: result.token,
        refreshToken: result.refreshToken,
      });
      res.status(HTTP_STATUS.OK).json({ client: result.client });
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
// Reads the refresh token from the httpOnly client_refresh_token cookie, rotates
// it, and re-sets both cookies.
accountRouter.post("/refresh", authRateLimiter, async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[AUTH_COOKIES.CLIENT.REFRESH];
    if (!refreshToken) {
      throw new UnauthorizedError(AUTH_ERROR_CODES.INVALID_TOKEN);
    }
    const result = await service.refresh(refreshToken);
    setAuthCookies(res, AUTH_COOKIES.CLIENT, CLIENT_REFRESH_COOKIE_PATH, {
      accessToken: result.token,
      refreshToken: result.refreshToken,
    });
    res.status(HTTP_STATUS.OK).json({ client: result.client });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/account/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags:
 *       - Account
 */
// Revokes the refresh token (from its cookie) and clears both auth cookies.
accountRouter.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[AUTH_COOKIES.CLIENT.REFRESH];
    if (refreshToken) {
      await service.logout(refreshToken);
    }
    clearAuthCookies(res, AUTH_COOKIES.CLIENT, CLIENT_REFRESH_COOKIE_PATH);
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
    email: req.identity?.data || null,
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

/**
 * @swagger
 * /api/account/bookings/{id}:
 *   put:
 *     summary: Edit a booking owned by the authenticated client (pending only)
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
 *     responses:
 *       200:
 *         description: Updated booking summary
 *       404:
 *         description: Booking not found (or not owned by the client)
 *       409:
 *         description: Booking not editable (not pending) or slot unavailable
 */
accountRouter.put(
  "/bookings/:id",
  requireClient,
  validateRequest({
    params: accountBookingIdParamsSchema,
    body: accountBookingEditBodySchema,
  }),
  async (req, res, next) => {
    try {
      const clientId = req.identity?.sub;
      if (!clientId) {
        throw new UnauthorizedError();
      }
      const body = req.body as {
        eventDate?: string;
        durationHours?: number;
        location?: { address: string; lat?: number; lng?: number };
        context?: string | null;
        capacity?: number;
        ticketPriceCents?: number;
      };
      const result = await service.editBooking(
        clientId,
        req.params.id as string,
        body,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default accountRouter;
