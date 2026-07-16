import { config } from "@src/helpers/config";
import {
  EmailLocale,
  EmailPayload,
  EmailTemplate,
} from "@src/services/mailer/emailConstants";
import { COPY, HELLO, LABELS } from "@src/services/mailer/templates/copy";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  getString,
} from "@src/services/mailer/templates/format";
import { renderLayout } from "@src/services/mailer/templates/layout";
import {
  EmailContent,
  EmailFact,
  RenderedEmail,
} from "@src/services/mailer/templates/types";

/** Payload keys written by the producers that enqueue each template. */
const KEY = {
  CLIENT_NAME: "clientName",
  DISPLAY_NAME: "displayName",
  STAGE_NAME: "stageName",
  ARTIST_STAGE_NAME: "artistStageName",
  EVENT_DATE: "eventDate",
  QUOTED_TOTAL_CENTS: "quotedTotalCents",
  DEPOSIT_AMOUNT_CENTS: "depositAmountCents",
  EXPIRES_AT: "expiresAt",
  REASON: "reason",
  BOOKING_ID: "bookingId",
  CONTRACT_ID: "contractId",
  RESET_URL: "resetUrl",
  CLAIM_URL: "claimUrl",
  INVITATION_URL: "invitationUrl",
  CUSTOM_MESSAGE: "customMessage",
  NAME: "name",
  EMAIL: "email",
  MESSAGE: "message",
} as const;

/** Client area landing page, mirrored from the frontend `PAGES.accountDashboard` route. */
const CLIENT_AREA_PATH = "account";

const buildClientAreaUrl = (locale: EmailLocale): string => {
  const baseUrl = config.app.baseUrl.replace(/\/+$/, "");
  return `${baseUrl}/${locale}/${CLIENT_AREA_PATH}`;
};

const greet = (
  payload: EmailPayload,
  key: string,
  locale: EmailLocale,
): string => {
  const name = getString(payload, key);
  return name ? `${HELLO[locale]} ${name}` : HELLO[locale];
};

/** Drops details the payload did not carry, so no email shows an empty row. */
const factsOf = (entries: Array<EmailFact | null>): EmailFact[] =>
  entries.filter((entry): entry is EmailFact => entry !== null);

const fact = (label: string, value: string): EmailFact | null =>
  value ? { label, value } : null;

type TemplateBuilder = (
  payload: EmailPayload,
  locale: EmailLocale,
) => EmailContent;

/**
 * Each builder turns a payload into content: the locale's copy plus the facts
 * and links that payload carries. Payload fields are best-effort by design —
 * see `format.ts`.
 */
const BUILDERS: Record<EmailTemplate, TemplateBuilder> = {
  [EmailTemplate.BOOKING_CONFIRMATION]: (payload, locale) => {
    const copy = COPY[EmailTemplate.BOOKING_CONFIRMATION][locale];
    return {
      title: copy.title,
      greeting: greet(payload, KEY.CLIENT_NAME, locale),
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(LABELS.artist[locale], getString(payload, KEY.ARTIST_STAGE_NAME)),
        fact(
          LABELS.eventDate[locale],
          formatDate(payload, KEY.EVENT_DATE, locale),
        ),
        fact(
          LABELS.total[locale],
          formatMoney(payload, KEY.QUOTED_TOTAL_CENTS, locale),
        ),
        fact(
          LABELS.deposit[locale],
          formatMoney(payload, KEY.DEPOSIT_AMOUNT_CENTS, locale),
        ),
      ]),
      cta: null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.BOOKING_APPROVED]: (payload, locale) => {
    const copy = COPY[EmailTemplate.BOOKING_APPROVED][locale];
    return {
      title: copy.title,
      greeting: greet(payload, KEY.CLIENT_NAME, locale),
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(LABELS.artist[locale], getString(payload, KEY.ARTIST_STAGE_NAME)),
        fact(
          LABELS.eventDate[locale],
          formatDate(payload, KEY.EVENT_DATE, locale),
        ),
      ]),
      cta: null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.BOOKING_REJECTED]: (payload, locale) => {
    const copy = COPY[EmailTemplate.BOOKING_REJECTED][locale];
    return {
      title: copy.title,
      greeting: greet(payload, KEY.CLIENT_NAME, locale),
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(LABELS.reason[locale], getString(payload, KEY.REASON)),
      ]),
      cta: null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.BOOKING_CONFIRMED]: (payload, locale) => {
    const copy = COPY[EmailTemplate.BOOKING_CONFIRMED][locale];
    return {
      title: copy.title,
      greeting: greet(payload, KEY.CLIENT_NAME, locale),
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(LABELS.artist[locale], getString(payload, KEY.ARTIST_STAGE_NAME)),
        fact(
          LABELS.eventDate[locale],
          formatDate(payload, KEY.EVENT_DATE, locale),
        ),
      ]),
      cta: copy.cta
        ? { label: copy.cta, url: buildClientAreaUrl(locale) }
        : null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.BOOKING_CANCELLED]: (payload, locale) => {
    const copy = COPY[EmailTemplate.BOOKING_CANCELLED][locale];
    return {
      title: copy.title,
      greeting: greet(payload, KEY.CLIENT_NAME, locale),
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(LABELS.artist[locale], getString(payload, KEY.ARTIST_STAGE_NAME)),
        fact(
          LABELS.eventDate[locale],
          formatDate(payload, KEY.EVENT_DATE, locale),
        ),
        fact(LABELS.reason[locale], getString(payload, KEY.REASON)),
      ]),
      cta: null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.CONTRACT_READY]: (payload, locale) =>
    buildContractContent(EmailTemplate.CONTRACT_READY, payload, locale),

  [EmailTemplate.CONTRACT_SIGNED]: (payload, locale) =>
    buildContractContent(EmailTemplate.CONTRACT_SIGNED, payload, locale),

  [EmailTemplate.CONTRACT_REMINDER]: (payload, locale) =>
    buildContractContent(EmailTemplate.CONTRACT_REMINDER, payload, locale),

  [EmailTemplate.PASSWORD_RESET]: (payload, locale) => {
    const copy = COPY[EmailTemplate.PASSWORD_RESET][locale];
    const resetUrl = getString(payload, KEY.RESET_URL);
    return {
      title: copy.title,
      greeting: HELLO[locale],
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(
          LABELS.expiresAt[locale],
          formatDateTime(payload, KEY.EXPIRES_AT, locale),
        ),
      ]),
      cta: copy.cta && resetUrl ? { label: copy.cta, url: resetUrl } : null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.CONTACT_MESSAGE]: (payload, locale) => {
    const copy = COPY[EmailTemplate.CONTACT_MESSAGE][locale];
    return {
      title: copy.title,
      greeting: HELLO[locale],
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(LABELS.name[locale], getString(payload, KEY.NAME)),
        fact(LABELS.email[locale], getString(payload, KEY.EMAIL)),
        fact(LABELS.message[locale], getString(payload, KEY.MESSAGE)),
      ]),
      cta: null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.CONTACT_ACK]: (payload, locale) => {
    const copy = COPY[EmailTemplate.CONTACT_ACK][locale];
    return {
      title: copy.title,
      greeting: greet(payload, KEY.NAME, locale),
      paragraphs: copy.paragraphs,
      facts: [],
      cta: null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.CLIENT_INVITATION]: (payload, locale) => {
    const copy = COPY[EmailTemplate.CLIENT_INVITATION][locale];
    const claimUrl = getString(payload, KEY.CLAIM_URL);
    return {
      title: copy.title,
      greeting: greet(payload, KEY.DISPLAY_NAME, locale),
      paragraphs: copy.paragraphs,
      facts: factsOf([
        fact(
          LABELS.expiresAt[locale],
          formatDateTime(payload, KEY.EXPIRES_AT, locale),
        ),
      ]),
      cta: copy.cta && claimUrl ? { label: copy.cta, url: claimUrl } : null,
      outro: copy.outro ?? [],
    };
  },

  [EmailTemplate.ARTIST_INVITATION]: (payload, locale) => {
    const copy = COPY[EmailTemplate.ARTIST_INVITATION][locale];
    const invitationUrl = getString(payload, KEY.INVITATION_URL);
    const customMessage = getString(payload, KEY.CUSTOM_MESSAGE);
    return {
      title: copy.title,
      greeting: greet(payload, KEY.STAGE_NAME, locale),
      paragraphs: customMessage
        ? [...copy.paragraphs, customMessage]
        : copy.paragraphs,
      facts: factsOf([
        fact(
          LABELS.expiresAt[locale],
          formatDateTime(payload, KEY.EXPIRES_AT, locale),
        ),
      ]),
      cta:
        copy.cta && invitationUrl
          ? { label: copy.cta, url: invitationUrl }
          : null,
      outro: copy.outro ?? [],
    };
  },
};

/** The three contract emails differ only in wording — same facts, same link. */
function buildContractContent(
  template: EmailTemplate,
  payload: EmailPayload,
  locale: EmailLocale,
): EmailContent {
  const copy = COPY[template][locale];
  return {
    title: copy.title,
    greeting: greet(payload, KEY.CLIENT_NAME, locale),
    paragraphs: copy.paragraphs,
    facts: factsOf([
      fact(LABELS.bookingRef[locale], getString(payload, KEY.BOOKING_ID)),
      fact(LABELS.contractRef[locale], getString(payload, KEY.CONTRACT_ID)),
    ]),
    cta: copy.cta ? { label: copy.cta, url: buildClientAreaUrl(locale) } : null,
    outro: copy.outro ?? [],
  };
}

export const renderEmail = (
  template: EmailTemplate,
  locale: EmailLocale,
  payload: EmailPayload,
): RenderedEmail => {
  const builder = BUILDERS[template];
  // Retries read the template back from the queue table, so a row written by an
  // older revision can name a template this one no longer knows.
  if (!builder) {
    throw new Error(`Unknown email template: ${template}`);
  }

  const content = builder(payload, locale);
  const { text, html } = renderLayout(content, locale);

  return { subject: COPY[template][locale].subject, text, html };
};

export type { RenderedEmail };
