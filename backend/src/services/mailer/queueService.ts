import pool from "@src/db/dbConnect";
import { enqueueEmailDelivery } from "@src/db/query/email/enqueueEmailDelivery.types";
import { listFailedEmails } from "@src/db/query/email/listFailedEmails.types";
import { markEmailFailed } from "@src/db/query/email/markEmailFailed.types";
import { markEmailSent } from "@src/db/query/email/markEmailSent.types";
import { logger } from "@src/helpers/logger";
import { getMailerService } from "@src/services/mailer";
import {
  DEFAULT_EMAIL_LOCALE,
  EMAIL_LOCALES,
  EmailLocale,
  EmailPayload,
  EmailTemplate,
} from "@src/services/mailer/emailConstants";
import { renderEmail } from "@src/services/mailer/templates";

export type {
  EmailLocale,
  EmailPayload,
} from "@src/services/mailer/emailConstants";
export {
  DEFAULT_EMAIL_LOCALE,
  EMAIL_LOCALES,
  EmailTemplate,
} from "@src/services/mailer/emailConstants";

/** Rows read back on retry carry whatever locale was persisted; keep them sendable. */
const toLocale = (value: string): EmailLocale =>
  EMAIL_LOCALES.includes(value as EmailLocale)
    ? (value as EmailLocale)
    : DEFAULT_EMAIL_LOCALE;

export class EmailQueueService {
  async enqueue(input: {
    template: EmailTemplate;
    recipient: string;
    locale: EmailLocale;
    payload: EmailPayload;
  }): Promise<void> {
    const rows = await enqueueEmailDelivery.run(
      {
        template: input.template,
        recipient: input.recipient,
        locale: input.locale,
        payload: JSON.stringify(input.payload),
      },
      pool,
    );
    const id = rows[0]?.id;
    if (!id) return;

    await this.attempt({
      id,
      template: input.template,
      recipient: input.recipient,
      locale: input.locale,
      payload: input.payload,
    });
  }

  async processRetries(limit = 50): Promise<{ processed: number }> {
    const rows = await listFailedEmails.run({ pageLimit: limit }, pool);
    let processed = 0;
    for (const row of rows) {
      await this.attempt({
        id: row.id,
        template: row.template as EmailTemplate,
        recipient: row.recipient,
        locale: toLocale(row.locale),
        payload: row.payload as EmailPayload,
      });
      processed += 1;
    }
    return { processed };
  }

  private async attempt(input: {
    id: string;
    template: EmailTemplate;
    recipient: string;
    locale: EmailLocale;
    payload: EmailPayload;
  }): Promise<void> {
    try {
      const rendered = renderEmail(input.template, input.locale, input.payload);
      await getMailerService().send({
        to: input.recipient,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
      await markEmailSent.run({ emailId: input.id }, pool);
    } catch (error) {
      const message = (error as Error).message;
      logger.error("Email send failed", { id: input.id, error: message });
      await markEmailFailed.run(
        { emailId: input.id, lastError: message },
        pool,
      );
    }
  }
}

let singleton: EmailQueueService | null = null;
export function getEmailQueue(): EmailQueueService {
  if (!singleton) singleton = new EmailQueueService();
  return singleton;
}
