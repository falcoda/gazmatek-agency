import {
  SendContactMessageBody,
  SendContactMessageResponse,
} from "@src/controllers/contact/types";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import { logger } from "@src/helpers/logger";
import ContactService from "@src/services/contact/contactService";
import { NextFunction, Request, Response } from "express";

export const CONTACT_MESSAGES = {
  SENT: "Message sent",
  SILENT_DROP: "ok",
} as const;

export class ContactHandler {
  constructor(private contactService: ContactService) {}

  send = async (
    req: Request<Record<string, never>, unknown, SendContactMessageBody>,
    res: Response<SendContactMessageResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Honeypot: silently accept-and-ignore bot submissions so they don't
      // realize the form rejected them.
      if (req.body.website && req.body.website.length > 0) {
        logger.warn("Contact honeypot triggered, request silently dropped", {
          ip: req.ip,
        });
        res
          .status(HTTP_STATUS.OK)
          .json({ message: CONTACT_MESSAGES.SILENT_DROP, delivered: false });
        return;
      }

      const result = await this.contactService.sendMessage({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
      });

      res.status(HTTP_STATUS.OK).json({
        message: CONTACT_MESSAGES.SENT,
        delivered: result.delivered,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ContactHandler;
