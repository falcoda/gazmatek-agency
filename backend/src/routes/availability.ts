import pool from "@src/db/dbConnect";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import { validateRequest } from "@src/helpers/validation";
import {
  availabilityParamsSchema,
  availabilityQuerySchema,
} from "@src/schemas/availability";
import AvailabilityService from "@src/services/availability/availabilityService";
import { NextFunction, Request, Response, Router } from "express";

const availabilityRouter = Router();
const service = new AvailabilityService(pool);

/**
 * @swagger
 * /api/availability/{id}/availability:
 *   get:
 *     summary: Get an artist public availability calendar (public)
 *     tags:
 *       - Availability
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Artist id.
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Range start, ISO date or date-time.
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Range end, ISO date or date-time.
 *     responses:
 *       200:
 *         description: Per-day availability over the requested range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 days:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         description: YYYY-MM-DD
 *                       status:
 *                         type: string
 *                         enum: [free, partial, busy]
 *       400:
 *         description: Invalid date range.
 */
availabilityRouter.get(
  "/:id/availability",
  validateRequest({
    params: availabilityParamsSchema,
    query: availabilityQuerySchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as { from: string; to: string };
      const result = await service.getPublic({
        artistId: req.params.id as string,
        from: query.from,
        to: query.to,
      });
      // Strict public serialization: only `date` and `status` are exposed.
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default availabilityRouter;
