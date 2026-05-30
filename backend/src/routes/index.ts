import { apiRateLimiter } from "@src/middleware/security/rateLimit";
import accountRouter from "@src/routes/account";
import adminRouter from "@src/routes/admin";
import artistRouter from "@src/routes/artist";
import artistAreaRouter from "@src/routes/artistArea";
import artistAuthRouter from "@src/routes/artistAuth";
import artistInvitationsRouter from "@src/routes/artistInvitations";
import authRouter from "@src/routes/auth";
import availabilityRouter from "@src/routes/availability";
import bookingRouter from "@src/routes/booking";
import contactRouter from "@src/routes/contact";
import contentRouter from "@src/routes/content";
import healthRouter from "@src/routes/health";
import pricingRouter from "@src/routes/pricing";
import statsRouter from "@src/routes/stats";
import storageRouter from "@src/routes/storage";
import webhookRouter from "@src/routes/webhook";
import { Router } from "express";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);

// Documenso webhook (electronic signature). No rate limit — Documenso retries
// failed deliveries. Signature verification is enforced inside the handler.
router.use("/webhooks", webhookRouter);

// Static-like assets (uploaded files). Public read-only, no rate limit so
// images load reliably on first paint.
router.use("/storage", storageRouter);

router.use(apiRateLimiter);
router.use("/artists", artistRouter);
router.use("/stats", statsRouter);
router.use("/pricing", pricingRouter);
router.use("/contact", contactRouter);
router.use("/bookings", bookingRouter);
router.use("/artists", availabilityRouter); // mounts /api/artists/:id/availability
router.use("/artist/auth", artistAuthRouter);
router.use("/artist/invitations", artistInvitationsRouter);
router.use("/artist", artistAreaRouter);
router.use("/account", accountRouter);
router.use("/admin", adminRouter);
router.use("/content", contentRouter);

export default router;
