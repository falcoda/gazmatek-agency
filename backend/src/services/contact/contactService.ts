import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import { getMailerService } from "@src/services/mailer";

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSendResult {
  delivered: boolean;
}

export class ContactService {
  async sendMessage(input: ContactMessageInput): Promise<ContactSendResult> {
    const mailer = getMailerService();
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

    const adminBody = [
      `Nouveau message de contact`,
      ``,
      `De : ${input.name} <${input.email}>`,
      `Sujet : ${input.subject}`,
      ``,
      input.message,
    ].join("\n");

    const autoReplyBody = [
      `Bonjour ${input.name},`,
      ``,
      `Nous avons bien reçu votre message et nous vous répondrons dans les meilleurs délais (24h ouvrées).`,
      ``,
      `— L'équipe Gazmatek`,
    ].join("\n");

    await mailer.send({
      to: recipient,
      subject: `[Contact] ${input.subject}`,
      text: adminBody,
    });

    await mailer.send({
      to: input.email,
      subject: `Gazmatek — Confirmation de votre message`,
      text: autoReplyBody,
    });

    logger.info("Contact message delivered", {
      from: input.email,
      subject: input.subject,
    });

    return { delivered: true };
  }
}

export default ContactService;
