import ExampleController from "@src/controllers/example";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import { authenticate } from "@src/middleware/auth/authenticate";
import {
  createExampleBodySchema,
  deleteExampleBodySchema,
  exampleByIdQuerySchema,
  listExamplesQuerySchema,
  updateExampleBodySchema,
} from "@src/schemas/example";
import { Router } from "express";

const exampleRouter = Router();
const exampleController = new ExampleController(pool);

/**
 * ⭐ TEMPLATE ROUTES
 *
 * This is an EXAMPLE route module for the Backend Template.
 *
 * STRUCTURE PATTERN:
 * ├── POST /endpoint        — Create resource
 * ├── GET /endpoint/:id     — Get resource by ID
 * ├── GET /endpoint         — List resources
 * ├── PUT /endpoint         — Update resource
 * └── DELETE /endpoint      — Delete resource
 *
 * TO CUSTOMIZE:
 * 1. Replace 'example' with your domain (e.g., 'products', 'users')
 * 2. Update paths (e.g., /products/:productId instead of /)
 * 3. Reference correct schemas (schemas/myentity.ts)
 * 4. Reference correct controller (controllers/myentity/index.ts)
 * 5. Add rate limiting if needed: router.use(rateLimit('api'))
 * 6. Update Swagger documentation
 *
 * STRICT RULE:
 * - All SQL queries MUST be in /src/db/query/example/ using pgtyped
 * - Never write raw SQL in routes (should also not be in controllers)
 * - Keep business logic in services, not routes
 *
 * See docs/DomainSetup.md for full setup guide.
 *
 * @swagger
 * /api/example:
 *   post:
 *     summary: Create a new example
 *     tags:
 *       - Example
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExampleBody'
 *     responses:
 *       201:
 *         description: Example created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateExampleResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: List examples with pagination
 *     tags:
 *       - Example
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts at 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of examples
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListExampleResponse'
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update an existing example
 *     tags:
 *       - Example
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExampleBody'
 *     responses:
 *       200:
 *         description: Example updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateExampleResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Example not found
 *   delete:
 *     summary: Soft-delete an example
 *     tags:
 *       - Example
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteExampleBody'
 *     responses:
 *       200:
 *         description: Example deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteExampleResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Example not found or already deleted
 * /api/example/{id}:
 *   get:
 *     summary: Get a single example by ID
 *     tags:
 *       - Example
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: example_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the example to retrieve
 *     responses:
 *       200:
 *         description: Example found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExampleItem'
 *       400:
 *         description: Validation error (missing example_id)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Example not found or soft-deleted
 */
exampleRouter.post(
  "/",
  authenticate(pool),
  validateRequest({ body: createExampleBodySchema }),
  exampleController.add,
);
exampleRouter.get(
  "/",
  authenticate(pool),
  validateRequest({ query: listExamplesQuerySchema }),
  exampleController.list,
);
exampleRouter.get(
  "/:id",
  authenticate(pool),
  validateRequest({ query: exampleByIdQuerySchema }),
  exampleController.getById,
);
exampleRouter.put(
  "/",
  authenticate(pool),
  validateRequest({ body: updateExampleBodySchema }),
  exampleController.update,
);
exampleRouter.delete(
  "/",
  authenticate(pool),
  validateRequest({ body: deleteExampleBodySchema }),
  exampleController.delete,
);

export default exampleRouter;
