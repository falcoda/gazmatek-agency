import HealthController from "@src/controllers/health/healthController";
import pool from "@src/db/dbConnect";
import { Router } from "express";

const healthRouter = Router();
const healthController = new HealthController(pool);

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is alive
 */
healthRouter.get("/live", healthController.live.bind(healthController));

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is ready
 */
healthRouter.get("/ready", healthController.ready.bind(healthController));

/**
 * @swagger
 * /api/health/details:
 *   get:
 *     summary: Detailed health and runtime information
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Detailed health payload
 */
healthRouter.get("/details", healthController.details.bind(healthController));

export default healthRouter;
