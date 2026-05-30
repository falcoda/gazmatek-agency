import { config } from "@src/helpers/config";
import { ERROR_MESSAGES, HTTP_STATUS } from "@src/helpers/error/constants";
import logger from "@src/helpers/logger";
import { documensoWebhookBodySchema } from "@src/schemas/webhook";
import { DOCUMENSO_COMPLETION_EVENTS } from "@src/services/contract/contractConstants";
import { handleSignedDocument } from "@src/services/contract/contractWebhookService";
import crypto from "crypto";
import { NextFunction, Request, Response, Router } from "express";

const DOCUMENSO_SIGNATURE_HEADER = "x-documenso-secret";
const COMPLETION_EVENTS = new Set<string>(DOCUMENSO_COMPLETION_EVENTS);

const verifyDocumensoSignature = (req: Request, secret: string): boolean => {
  const header = req.headers[DOCUMENSO_SIGNATURE_HEADER];
  const receivedSecret = Array.isArray(header) ? header[0] : header;

  if (!receivedSecret) {
    return false;
  }

  // Try plain comparison first — Documenso sends the configured secret as-is.
  try {
    if (
      crypto.timingSafeEqual(
        Buffer.from(receivedSecret, "utf8"),
        Buffer.from(secret, "utf8"),
      )
    ) {
      return true;
    }
  } catch {
    // length mismatch → not equal, fall through to HMAC
  }

  // Fallback: HMAC-SHA256(rawBody) — supports installations that hash the body.
  try {
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody ?? "")
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(receivedSecret, "utf8"),
      Buffer.from(hmac, "utf8"),
    );
  } catch {
    return false;
  }
};

const webhookRouter = Router();

/**
 * @swagger
 * /api/webhooks/documenso:
 *   post:
 *     summary: Documenso webhook — called when a document is signed.
 *     tags:
 *       - Webhooks
 *     responses:
 *       200:
 *         description: Webhook processed (or ignored for non-completion events)
 *       400:
 *         description: Missing document id in payload
 *       401:
 *         description: Invalid Documenso signature
 */
webhookRouter.post(
  "/documenso",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // HMAC verification uses the raw body captured by express.json's verify
      // callback — it must run before any parsing of req.body.
      if (
        config.documenso.webhookSecret &&
        !verifyDocumensoSignature(req, config.documenso.webhookSecret)
      ) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: ERROR_MESSAGES.INVALID_DOCUMENSO_SIGNATURE });
        return;
      }

      const parsed = documensoWebhookBodySchema.safeParse(req.body);
      if (!parsed.success) {
        logger.warn("Documenso webhook: invalid payload", {
          issues: parsed.error.issues,
        });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: ERROR_MESSAGES.VALIDATION_ERROR,
        });
        return;
      }

      const payload = parsed.data;

      if (payload.event && !COMPLETION_EVENTS.has(payload.event)) {
        res.status(HTTP_STATUS.OK).json({ ok: true, ignored: true });
        return;
      }

      const result = await handleSignedDocument(payload);
      res.status(HTTP_STATUS.OK).json({ ok: true, ignored: !result.processed });
    } catch (error) {
      next(error);
    }
  },
);

export default webhookRouter;
