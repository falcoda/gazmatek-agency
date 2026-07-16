import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import {
  DEFAULT_EMAIL_LOCALE,
  EmailLocale,
  EmailTemplate,
} from "@src/services/mailer/emailConstants";
import { getEmailQueue } from "@src/services/mailer/queueService";

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Language of the acknowledgement sent back to the sender. */
  locale: EmailLocale;
}

export interface ContactSendResult {
  delivered: boolean;
}

export class ContactService {
  async sendMessage(input: ContactMessageInput): Promise<ContactSendResult> {
    const defaultRecipients = config.mailer.defaultTo;
    const recipient =
      defaultRecipients.length > 0
        ? defaultRecipients.join(", ")
        : config.mailer.from;

    if (!recipient) {
      logger.warn(
        "Contact form received but no recipient configured (MAILER_DEFAULT_TO / MAILER_FROM)",
      );
      return { delivered: false };
    }

    // The team notification is internal, so it goes out in the app's default
    // locale rather than whatever language the visitor happened to browse in.
    await getEmailQueue().enqueue({
      template: EmailTemplate.CONTACT_MESSAGE,
      recipient,
      locale: DEFAULT_EMAIL_LOCALE,
      payload: {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
    });

    await getEmailQueue().enqueue({
      template: EmailTemplate.CONTACT_ACK,
      recipient: input.email,
      locale: input.locale,
      payload: { name: input.name },
    });

    logger.info("Contact message delivered", {
      from: input.email,
      subject: input.subject,
    });

    return { delivered: true };
  }
}

export default ContactService;
