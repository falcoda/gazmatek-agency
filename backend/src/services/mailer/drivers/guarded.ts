import { logger } from "@src/helpers/logger";
import { isReservedEmailRecipient } from "@src/services/mailer/reservedDomains";
import { MailerService, MailPayload } from "@src/services/mailer/types";

/**
 * Decorates a real-delivery mailer driver and drops any message addressed to an
 * RFC-reserved domain (example.com, *.test, …) before it reaches the wire.
 *
 * Such recipients always bounce, and the bounces get the sending domain or IP
 * blacklisted, so skipping them protects the sender reputation while leaving
 * every legitimate recipient untouched. It is wired only around drivers that
 * actually send (SMTP); the logger driver never delivers, so it stays unguarded
 * to keep fake emails visible in development logs.
 */
export class GuardedMailerService implements MailerService {
  constructor(private readonly inner: MailerService) {}

  async send(payload: MailPayload): Promise<void> {
    if (isReservedEmailRecipient(payload.to)) {
      logger.warn(
        "Skipping email to reserved domain to avoid bounces and sender blacklisting",
        { to: payload.to, subject: payload.subject },
      );
      return;
    }

    await this.inner.send(payload);
  }

  async close(): Promise<void> {
    await this.inner.close();
  }
}
