import ContentController from "@src/controllers/content";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import { getPublicContentQuerySchema } from "@src/schemas/content";
import { Router } from "express";

const contentRouter = Router();
const contentController = new ContentController(pool);

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Public localized content blocks (public)
 *     tags:
 *       - Content
 *     parameters:
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *           enum: [fr, nl, en]
 *         description: Requested locale, defaults to the agency default locale.
 *     responses:
 *       200:
 *         description: Map of content block keys to localized values.
 *       422:
 *         description: Validation error.
 */
contentRouter.get(
  "/",
  validateRequest({ query: getPublicContentQuerySchema }),
  contentController.list,
);

export default contentRouter;
