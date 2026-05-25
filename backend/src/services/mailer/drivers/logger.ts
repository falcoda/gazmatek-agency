import { logger } from "@src/helpers/logger";
import { MailerService, MailPayload } from "@src/services/mailer/types";

export class LoggerMailerService implements MailerService {
  async send(payload: MailPayload): Promise<void> {
    logger.info("Mail emitted", payload);
  }

  async close(): Promise<void> {
    return;
  }
}
