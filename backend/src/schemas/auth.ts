import { z } from "zod";

/**
 * POST /auth/register - Register a new user
 * Validates: { email, password }
 */
export const registerBodySchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be <= 128 characters"),
});

/**
 * POST /auth/login - Login with email and password
 * Validates: { email, password }
 */
export const loginBodySchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /auth/refresh - Refresh access token
 * Validates: { refreshToken }
 */
export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * POST /auth/forgot-password - Request a password reset link
 * Validates: { email }
 */
export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

/**
 * POST /auth/reset-password - Reset the password with a reset token
 * Validates: { token, newPassword }
 */
export const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be <= 128 characters"),
});
