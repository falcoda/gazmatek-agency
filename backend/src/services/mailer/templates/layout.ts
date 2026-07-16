import { EmailLocale } from "@src/services/mailer/emailConstants";
import { escapeHtml } from "@src/services/mailer/templates/format";
import { EmailContent, EmailFact } from "@src/services/mailer/templates/types";

export const BRAND_NAME = "Gazmatek";

/** Automated-sender notice, closing every email. */
const FOOTER_NOTE: Record<EmailLocale, string> = {
  fr: `Cet email a été envoyé automatiquement par ${BRAND_NAME}. Merci de ne pas y répondre.`,
  nl: `Deze e-mail is automatisch verzonden door ${BRAND_NAME}. Gelieve niet te antwoorden.`,
  en: `This email was sent automatically by ${BRAND_NAME}. Please do not reply.`,
};

/** Shown under the button for clients whose reader strips links. */
const CTA_FALLBACK: Record<EmailLocale, string> = {
  fr: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
  nl: "Werkt de knop niet? Kopieer deze link naar uw browser:",
  en: "If the button does not work, copy this link into your browser:",
};

const COLORS = {
  background: "#f4f4f5",
  card: "#ffffff",
  header: "#111111",
  headerText: "#ffffff",
  text: "#1f2933",
  muted: "#6b7280",
  border: "#e5e7eb",
  accent: "#111111",
  accentText: "#ffffff",
} as const;

const renderTextFacts = (facts: EmailFact[]): string[] =>
  facts.map((fact) => `${fact.label} : ${fact.value}`);

const renderHtmlFacts = (facts: EmailFact[]): string => {
  if (facts.length === 0) return "";

  const rows = facts
    .map(
      (fact) => `
            <tr>
              <td style="padding:6px 16px 6px 0;color:${COLORS.muted};font-size:14px;white-space:nowrap;">${escapeHtml(fact.label)}</td>
              <td style="padding:6px 0;color:${COLORS.text};font-size:14px;font-weight:600;">${escapeHtml(fact.value)}</td>
            </tr>`,
    )
    .join("");

  return `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;border-collapse:collapse;">
            <tbody>${rows}
            </tbody>
          </table>`;
};

const renderHtmlParagraphs = (paragraphs: string[]): string =>
  paragraphs
    .map(
      (paragraph) =>
        `\n          <p style="margin:0 0 16px 0;color:${COLORS.text};font-size:15px;line-height:1.6;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

const renderHtmlCta = (content: EmailContent, locale: EmailLocale): string => {
  if (!content.cta) return "";

  const url = escapeHtml(content.cta.url);
  return `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
            <tbody>
              <tr>
                <td style="border-radius:6px;background:${COLORS.accent};">
                  <a href="${url}" style="display:inline-block;padding:13px 26px;color:${COLORS.accentText};font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(content.cta.label)}</a>
                </td>
              </tr>
            </tbody>
          </table>
          <p style="margin:0 0 8px 0;color:${COLORS.muted};font-size:12px;line-height:1.5;">${escapeHtml(CTA_FALLBACK[locale])}</p>
          <p style="margin:0 0 24px 0;font-size:12px;line-height:1.5;word-break:break-all;"><a href="${url}" style="color:${COLORS.muted};">${url}</a></p>`;
};

/** Plain-text rendering — the body every client can display. */
const renderText = (content: EmailContent, locale: EmailLocale): string => {
  const blocks: string[] = [`${content.greeting},`, ...content.paragraphs];

  const facts = renderTextFacts(content.facts);
  if (facts.length > 0) blocks.push(facts.join("\n"));

  if (content.cta) {
    blocks.push(`${content.cta.label} : ${content.cta.url}`);
  }

  blocks.push(...content.outro, `— ${BRAND_NAME}`, FOOTER_NOTE[locale]);

  return blocks.join("\n\n");
};

/** HTML rendering — inline styles and tables, the only layout email clients agree on. */
const renderHtml = (content: EmailContent, locale: EmailLocale): string => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.background};margin:0;padding:24px 0;">
  <tbody>
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${COLORS.card};border-radius:10px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">
          <tbody>
            <tr>
              <td style="background:${COLORS.header};padding:20px 32px;color:${COLORS.headerText};font-size:18px;font-weight:700;letter-spacing:0.04em;">${escapeHtml(BRAND_NAME.toUpperCase())}</td>
            </tr>
            <tr>
              <td style="padding:32px;">
          <h1 style="margin:0 0 20px 0;color:${COLORS.text};font-size:20px;line-height:1.35;">${escapeHtml(content.title)}</h1>
          <p style="margin:0 0 16px 0;color:${COLORS.text};font-size:15px;line-height:1.6;">${escapeHtml(content.greeting)},</p>${renderHtmlParagraphs(content.paragraphs)}${renderHtmlFacts(content.facts)}${renderHtmlCta(content, locale)}${renderHtmlParagraphs(content.outro)}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${COLORS.border};padding:20px 32px;color:${COLORS.muted};font-size:12px;line-height:1.5;">${escapeHtml(FOOTER_NOTE[locale])}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;

export const renderLayout = (
  content: EmailContent,
  locale: EmailLocale,
): { text: string; html: string } => ({
  text: renderText(content, locale),
  html: renderHtml(content, locale),
});
