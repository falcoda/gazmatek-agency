import StatsController from "@src/controllers/stats";
import pool from "@src/db/dbConnect";
import { Router } from "express";

const statsRouter = Router();
const statsController = new StatsController(pool);

/**
 * @swagger
 * /api/stats/home:
 *   get:
 *     summary: Public aggregated stats for the home hero (artist roster size, produced events)
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: Home stats payload.
 */
statsRouter.get("/home", statsController.home);

export default statsRouter;
