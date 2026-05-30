import ArtistController from "@src/controllers/artist";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import {
  getArtistBySlugParamsSchema,
  getArtistBySlugQuerySchema,
  listArtistsQuerySchema,
} from "@src/schemas/artist";
import { Router } from "express";

const artistRouter = Router();
const artistController = new ArtistController(pool);

/**
 * @swagger
 * /api/artists:
 *   get:
 *     summary: List published artists with optional filters (public)
 *     tags:
 *       - Artist
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [fr, nl, en] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 24 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50 }
 *         description: Alias for page_size used by the Home featured query.
 *     responses:
 *       200:
 *         description: Paginated list of artists.
 * /api/artists/{slug}:
 *   get:
 *     summary: Get a published artist by slug (public)
 *     tags:
 *       - Artist
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [fr, nl, en] }
 *     responses:
 *       200:
 *         description: Artist detail with photos.
 *       404:
 *         description: Artist not found or not published.
 */
artistRouter.get(
  "/",
  validateRequest({ query: listArtistsQuerySchema }),
  artistController.list,
);

artistRouter.get(
  "/:slug",
  validateRequest({
    params: getArtistBySlugParamsSchema,
    query: getArtistBySlugQuerySchema,
  }),
  artistController.getBySlug,
);

export default artistRouter;
