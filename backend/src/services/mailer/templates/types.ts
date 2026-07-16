/**
 * The shape every email template produces.
 *
 * Templates describe *what* an email says; the layout decides how it looks in
 * text and HTML. Keeping the two apart means a new email is a copy change, not
 * a markup change.
 */

/** A `label: value` detail line, rendered as a table row in HTML. */
export interface EmailFact {
  label: string;
  value: string;
}

/** The single primary action of an email, rendered as a button in HTML. */
export interface EmailCta {
  label: string;
  url: string;
}

export interface EmailContent {
  /** Headline shown at the top of the body — not the subject line. */
  title: string;
  /** Salutation without trailing punctuation, e.g. `Bonjour Marie`. */
  greeting: string;
  paragraphs: string[];
  facts: EmailFact[];
  cta: EmailCta | null;
  /** Closing paragraphs shown after the call to action. */
  outro: string[];
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}
