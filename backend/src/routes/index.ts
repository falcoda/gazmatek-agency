import { apiRateLimiter } from "@src/middleware/security/rateLimit";
import authRouter from "@src/routes/auth";
import exampleRouter from "@src/routes/example";
import healthRouter from "@src/routes/health";
import { Router } from "express";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use(apiRateLimiter);
router.use("/example", exampleRouter);

export default router;
