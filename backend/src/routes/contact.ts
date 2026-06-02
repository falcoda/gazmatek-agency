import ContactController from "@src/controllers/contact";
import { validateRequest } from "@src/helpers/validation";
import { contactRateLimiter } from "@src/middleware/security/rateLimit";
import { sendContactMessageBodySchema } from "@src/schemas/contact";
import { Router } from "express";

const contactRouter = Router();
const contactController = new ContactController();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send a contact message (public)
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               subject: { type: string }
 *               message: { type: string }
 *               website: { type: string, description: "Honeypot, must be empty" }
 *     responses:
 *       200:
 *         description: Message delivered (or silently dropped if honeypot).
 *       422:
 *         description: Validation error.
 */
contactRouter.post(
  "/",
  contactRateLimiter,
  validateRequest({ body: sendContactMessageBodySchema }),
  contactController.send,
);

export default contactRouter;
