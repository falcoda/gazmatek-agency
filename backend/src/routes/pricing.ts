import PricingController from "@src/controllers/pricing";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import { artistFeeBodySchema, estimateBodySchema } from "@src/schemas/pricing";
import { Router } from "express";

const pricingRouter = Router();
const pricingController = new PricingController(pool);

/**
 * @swagger
 * /api/pricing/estimate:
 *   post:
 *     summary: Estimate a booking price (public)
 *     tags:
 *       - Pricing
 *     responses:
 *       200:
 *         description: Pricing breakdown.
 *       422:
 *         description: Invalid input.
 * /api/pricing/artist-fee:
 *   post:
 *     summary: Compute recommended artist fee for ticketed events (public)
 *     tags:
 *       - Pricing
 *     responses:
 *       200:
 *         description: Recommended fee, range and gross share.
 */
pricingRouter.post(
  "/estimate",
  validateRequest({ body: estimateBodySchema }),
  pricingController.estimate,
);

pricingRouter.post(
  "/artist-fee",
  validateRequest({ body: artistFeeBodySchema }),
  pricingController.artistFee,
);

pricingRouter.get("/grid", pricingController.grid);

export default pricingRouter;
