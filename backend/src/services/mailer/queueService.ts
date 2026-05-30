import pool from "@src/db/dbConnect";
import { enqueueEmailDelivery } from "@src/db/query/email/enqueueEmailDelivery.types";
import { listFailedEmails } from "@src/db/query/email/listFailedEmails.types";
import { markEmailFailed } from "@src/db/query/email/markEmailFailed.types";
import { markEmailSent } from "@src/db/query/email/markEmailSent.types";
import { logger } from "@src/helpers/logger";
import { getMailerService } from "@src/services/mailer";

export enum EmailTemplate {
  BOOKING_CONFIRMATION = "bookingConfirmation",
  BOOKING_APPROVED = "bookingApproved",
  BOOKING_REJECTED = "bookingRejected",
  BOOKING_CONFIRMED = "bookingConfirmed",
  BOOKING_CANCELLED = "bookingCancelled",
  CONTRACT_READY = "contractReady",
  CONTRACT_SIGNED = "contractSigned",
  CONTRACT_REMINDER = "contractReminder",
  PASSWORD_RESET = "passwordReset",
  CONTACT_MESSAGE = "contactMessage",
  CONTACT_ACK = "contactAck",
  CLIENT_INVITATION = "clientInvitation",
  ARTIST_INVITATION = "artistInvitation",
}

export type EmailLocale = "fr" | "nl" | "en";

export interface EmailPayload {
  [key: string]: unknown;
}

interface RenderedEmail {
  subject: string;
  body: string;
}

function renderEmail(
  template: EmailTemplate,
  locale: EmailLocale,
  payload: EmailPayload,
): RenderedEmail {
  // V1 simple inline rendering. Real templates would live in
  // src/services/mailer/templates/<template>/{fr,nl,en}.html and use a
  // template engine. We keep it inline for the MVP to avoid file glue and
  // keep emails readable in logs.
  const subjects: Record<EmailTemplate, Record<EmailLocale, string>> = {
    [EmailTemplate.BOOKING_CONFIRMATION]: {
      fr: "Gazmatek — Confirmez votre demande",
      nl: "Gazmatek — Bevestig uw aanvraag",
      en: "Gazmatek — Confirm your request",
    },
    [EmailTemplate.BOOKING_APPROVED]: {
      fr: "Gazmatek — Votre demande est validée",
      nl: "Gazmatek — Uw aanvraag is goedgekeurd",
      en: "Gazmatek — Your request is approved",
    },
    [EmailTemplate.BOOKING_REJECTED]: {
      fr: "Gazmatek — Votre demande n'a pas pu être traitée",
      nl: "Gazmatek — Uw aanvraag kon niet worden verwerkt",
      en: "Gazmatek — Your request could not be processed",
    },
    [EmailTemplate.BOOKING_CONFIRMED]: {
      fr: "Gazmatek — Réservation confirmée",
      nl: "Gazmatek — Reservering bevestigd",
      en: "Gazmatek — Booking confirmed",
    },
    [EmailTemplate.BOOKING_CANCELLED]: {
      fr: "Gazmatek — Réservation annulée",
      nl: "Gazmatek — Reservering geannuleerd",
      en: "Gazmatek — Booking cancelled",
    },
    [EmailTemplate.CONTRACT_READY]: {
      fr: "Gazmatek — Un contrat est à signer",
      nl: "Gazmatek — Een contract is klaar om te ondertekenen",
      en: "Gazmatek — A contract is ready to sign",
    },
    [EmailTemplate.CONTRACT_SIGNED]: {
      fr: "Gazmatek — Contrat signé",
      nl: "Gazmatek — Contract ondertekend",
      en: "Gazmatek — Contract signed",
    },
    [EmailTemplate.CONTRACT_REMINDER]: {
      fr: "Gazmatek — Rappel signature contrat",
      nl: "Gazmatek — Herinnering contract ondertekenen",
      en: "Gazmatek — Contract signature reminder",
    },
    [EmailTemplate.PASSWORD_RESET]: {
      fr: "Gazmatek — Réinitialisation du mot de passe",
      nl: "Gazmatek — Wachtwoord opnieuw instellen",
      en: "Gazmatek — Password reset",
    },
    [EmailTemplate.CONTACT_MESSAGE]: {
      fr: "Gazmatek — Nouveau message de contact",
      nl: "Gazmatek — Nieuw contactbericht",
      en: "Gazmatek — New contact message",
    },
    [EmailTemplate.CONTACT_ACK]: {
      fr: "Gazmatek — Confirmation de votre message",
      nl: "Gazmatek — Bevestiging van uw bericht",
      en: "Gazmatek — Confirmation of your message",
    },
    [EmailTemplate.CLIENT_INVITATION]: {
      fr: "Gazmatek — Activez votre espace client",
      nl: "Gazmatek — Activeer je klantruimte",
      en: "Gazmatek — Activate your client account",
    },
    [EmailTemplate.ARTIST_INVITATION]: {
      fr: "Gazmatek — Rejoignez notre roster d'artistes",
      nl: "Gazmatek — Sluit je aan bij ons artiestenroster",
      en: "Gazmatek — Join our artist roster",
    },
  };

  const subject = subjects[template][locale];
  const body = `Template: ${template}\nPayload: ${JSON.stringify(payload, null, 2)}`;
  return { subject, body };
}

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
        locale: row.locale as EmailLocale,
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
        text: rendered.body,
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
