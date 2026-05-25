import { z } from "zod";

/**
 * ⭐ TEMPLATE SCHEMAS
 *
 * This file contains Zod schemas for example domain validation.
 *
 * TO CUSTOMIZE:
 * 1. Replace 'example' with your domain name (e.g., 'product', 'user', 'post')
 * 2. Update field names and types to match your entity
 * 3. Add business logic validation (min/max lengths, patterns, etc.)
 * 4. Keep one schema per operation (create, update, delete, query)
 *
 * USAGE:
 * - createExampleBodySchema: Validates POST /examples request body
 * - updateExampleBodySchema: Validates PUT /examples/:id request body
 * - deleteExampleBodySchema: Validates DELETE /examples/:id request body
 * - exampleQuerySchema: Validates GET /examples?example_id=1 query params
 *
 * See docs/DomainSetup.md for full setup guide.
 */

/**
 * POST /examples - Create example
 * Validates: { name, description? }
 */
export const createExampleBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be <= 255 chars"),
  description: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .describe("Optional description"),
});

/**
 * PUT /examples/:id - Update example
 * Validates: { example_id, name?, description? }
 * All fields except example_id are optional for partial updates
 */
export const updateExampleBodySchema = z.object({
  example_id: z.union([z.number().int().positive(), z.string().min(1)]),
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().min(1).nullable().optional(),
});

/**
 * DELETE /examples/:id - Delete example
 * Validates: { example_id }
 */
export const deleteExampleBodySchema = z.object({
  example_id: z.union([z.number().int().positive(), z.string().min(1)]),
});

/**
 * GET /examples?example_id=1 - Query examples (optional filter)
 * Validates query parameters
 */
export const exampleQuerySchema = z.object({
  example_id: z.string().min(1).optional(),
});

/**
 * GET /examples/:id - Get example by ID (required)
 * Validates query parameters
 */
export const exampleByIdQuerySchema = z.object({
  example_id: z.string().min(1),
});

/**
 * GET /examples - List examples with pagination
 * Validates: { page?, limit? }
 */
export const listExamplesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
