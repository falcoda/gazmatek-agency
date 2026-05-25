import AuthController from "@src/controllers/auth";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import { authenticate } from "@src/middleware/auth/authenticate";
import { authRateLimiter } from "@src/middleware/security/rateLimit";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from "@src/schemas/auth";
import { Router } from "express";

const authRouter = Router();
const authController = new AuthController(pool);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterBody'
 *     responses:
 *       201:
 *         description: User created — returns access token, refresh token, and user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Validation error (invalid email or password too short)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login successful — returns access token, refresh token, and user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error (missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using a refresh token (token rotation)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshBody'
 *     responses:
 *       200:
 *         description: New token pair issued — old refresh token is invalidated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       400:
 *         description: Validation error (missing refreshToken)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshBody'
 *     responses:
 *       200:
 *         description: Logout successful — refresh token deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       400:
 *         description: Validation error (missing refreshToken)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized — missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
authRouter.post(
  "/register",
  authRateLimiter,
  validateRequest({ body: registerBodySchema }),
  authController.register,
);

authRouter.post(
  "/login",
  authRateLimiter,
  validateRequest({ body: loginBodySchema }),
  authController.login,
);

authRouter.post(
  "/refresh",
  authRateLimiter,
  validateRequest({ body: refreshBodySchema }),
  authController.refresh,
);

authRouter.post(
  "/logout",
  authenticate(pool),
  validateRequest({ body: refreshBodySchema }),
  authController.logout,
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Always 200 — a reset link is sent only if the account exists (no account enumeration)
 *       400:
 *         description: Validation error (invalid email)
 *
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset the password using a reset token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully — all refresh tokens are revoked
 *       400:
 *         description: Validation error (missing token or password too short)
 *       401:
 *         description: Invalid or expired reset token
 */
authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest({ body: forgotPasswordBodySchema }),
  authController.forgotPassword,
);

authRouter.post(
  "/reset-password",
  authRateLimiter,
  validateRequest({ body: resetPasswordBodySchema }),
  authController.resetPassword,
);

export default authRouter;
