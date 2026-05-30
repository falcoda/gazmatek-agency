import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "@src/schemas/auth";
import { z } from "zod";

/**
 * Converts a Zod schema to a JSON Schema / OpenAPI-compatible object.
 * Uses Zod v4 built-in z.toJSONSchema().
 */
function toSchema(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema) as Record<string, unknown>;
}

/**
 * OpenAPI component schemas derived from Zod schemas.
 * Registered in swagger.ts > components.schemas.
 *
 * To add a new schema:
 * 1. Define the Zod schema in src/schemas/<entity>.ts
 * 2. Import it here and add an entry below
 */
export const openApiSchemas: Record<string, Record<string, unknown>> = {
  // ── Auth ──────────────────────────────────────────────────────────────────

  RegisterBody: toSchema(registerBodySchema),
  LoginBody: toSchema(loginBodySchema),
  RefreshBody: toSchema(refreshBodySchema),

  AuthTokensResponse: {
    type: "object",
    required: ["accessToken", "refreshToken"],
    properties: {
      accessToken: { type: "string", description: "JWT access token (15 min)" },
      refreshToken: {
        type: "string",
        description: "Opaque refresh token (7 days)",
      },
    },
  },

  RegisterResponse: {
    allOf: [
      { $ref: "#/components/schemas/AuthTokensResponse" },
      {
        type: "object",
        required: ["user"],
        properties: {
          user: {
            type: "object",
            required: ["user_id", "email"],
            properties: {
              user_id: { type: "integer" },
              email: { type: "string", format: "email" },
            },
          },
        },
      },
    ],
  },

  LoginResponse: {
    allOf: [{ $ref: "#/components/schemas/RegisterResponse" }],
  },

  LogoutResponse: {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string", example: "Logout successful" },
    },
  },

  // ── Shared ────────────────────────────────────────────────────────────────

  ValidationErrorResponse: {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string", example: "Validation error" },
      details: { type: "array", items: { type: "object" } },
    },
  },

  PaginationMeta: {
    type: "object",
    required: ["page", "limit", "total", "totalPages"],
    properties: {
      page: { type: "integer", minimum: 1 },
      limit: { type: "integer", minimum: 1 },
      total: { type: "integer", minimum: 0 },
      totalPages: { type: "integer", minimum: 0 },
    },
  },
};
