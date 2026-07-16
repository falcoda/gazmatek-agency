import {
  EMAIL_LOCALES,
  EmailLocale,
  EmailTemplate,
} from "@src/services/mailer/emailConstants";
import { renderEmail } from "@src/services/mailer/templates";

const ALL_TEMPLATES = Object.values(EmailTemplate);

/** A payload holding every key any template reads, so each renders fully populated. */
const FULL_PAYLOAD = {
  clientName: "Marie Dupont",
  displayName: "Marie Dupont",
  stageName: "Gazmatek",
  artistStageName: "Gazmatek",
  eventDate: "2026-08-15T20:00:00.000Z",
  quotedTotalCents: 150000,
  depositAmountCents: 45000,
  expiresAt: "2026-07-23T15:45:16.105Z",
  reason: "L'artiste n'est pas disponible à cette date.",
  bookingId: "b1d2c3e4",
  contractId: "c9f8e7d6",
  resetUrl: "https://booking.gazmatek.com/fr/account/reset-password?token=abc",
  claimUrl: "https://booking.gazmatek.com/fr/account/claim?token=abc",
  invitationUrl: "https://booking.gazmatek.com/fr/artist/invitation?token=abc",
  customMessage: "On adore ton dernier set, rejoins-nous !",
  name: "Marie Dupont",
  email: "marie@example.com",
  message: "Bonjour, je souhaite réserver un artiste.",
};

describe("renderEmail", () => {
  describe.each(ALL_TEMPLATES)("%s", (template) => {
    it.each(EMAIL_LOCALES)("renders real copy in %s", (locale) => {
      const { subject, text, html } = renderEmail(
        template,
        locale,
        FULL_PAYLOAD,
      );

      expect(subject).toMatch(/^Gazmatek — .+/);
      expect(text.length).toBeGreaterThan(0);
      expect(html).toContain("<table");
    });

    it.each(EMAIL_LOCALES)(
      "never leaks the debug payload dump in %s",
      (locale) => {
        const { text, html } = renderEmail(template, locale, FULL_PAYLOAD);

        for (const body of [text, html]) {
          expect(body).not.toContain("Template:");
          expect(body).not.toContain("Payload:");
          // Raw payload keys are producer-side names; they must never reach a reader.
          expect(body).not.toContain("quotedTotalCents");
          expect(body).not.toContain("customMessage");
        }
      },
    );

    it.each(EMAIL_LOCALES)("renders without a payload in %s", (locale) => {
      const { text, html } = renderEmail(template, locale, {});

      expect(text).not.toContain("undefined");
      expect(html).not.toContain("undefined");
      // Facts drop out entirely rather than rendering an empty label.
      expect(text).not.toMatch(/ : \s*$/m);
    });
  });

  it("greets the recipient by name when the payload carries one", () => {
    const { text } = renderEmail(EmailTemplate.BOOKING_APPROVED, "fr", {
      clientName: "Marie Dupont",
    });

    expect(text).toContain("Bonjour Marie Dupont,");
  });

  it("falls back to a bare greeting when no name is available", () => {
    const { text } = renderEmail(EmailTemplate.BOOKING_APPROVED, "fr", {});

    expect(text).toContain("Bonjour,");
    expect(text).not.toContain("Bonjour ,");
  });

  it("formats money and dates for the reader instead of dumping raw values", () => {
    const { text } = renderEmail(EmailTemplate.BOOKING_CONFIRMATION, "fr", {
      artistStageName: "Gazmatek",
      eventDate: "2026-08-15T20:00:00.000Z",
      quotedTotalCents: 150000,
      depositAmountCents: 45000,
    });

    expect(text).toContain("15 août 2026");
    expect(text).toContain("€");
    expect(text).not.toContain("150000");
    expect(text).not.toContain("2026-08-15T20:00:00.000Z");
  });

  it("localizes the subject and body per locale", () => {
    const fr = renderEmail(EmailTemplate.ARTIST_INVITATION, "fr", FULL_PAYLOAD);
    const nl = renderEmail(EmailTemplate.ARTIST_INVITATION, "nl", FULL_PAYLOAD);
    const en = renderEmail(EmailTemplate.ARTIST_INVITATION, "en", FULL_PAYLOAD);

    expect(fr.subject).toContain("roster d'artistes");
    expect(nl.subject).toContain("artiestenroster");
    expect(en.subject).toContain("artist roster");

    expect(fr.text).toContain("Rejoindre le roster");
    expect(nl.text).toContain("Bij het roster aansluiten");
    expect(en.text).toContain("Join the roster");
  });

  it("includes the invitation link and the custom message", () => {
    const { text, html } = renderEmail(
      EmailTemplate.ARTIST_INVITATION,
      "fr",
      FULL_PAYLOAD,
    );

    expect(text).toContain(FULL_PAYLOAD.invitationUrl);
    expect(text).toContain(FULL_PAYLOAD.customMessage);
    expect(html).toContain(`href="${FULL_PAYLOAD.invitationUrl}"`);
  });

  it("drops the call to action when the payload has no link", () => {
    const { html } = renderEmail(EmailTemplate.ARTIST_INVITATION, "fr", {
      stageName: "Gazmatek",
    });

    expect(html).not.toContain("Rejoindre le roster");
  });

  it("links contract emails to the client area", () => {
    const { text } = renderEmail(EmailTemplate.CONTRACT_READY, "fr", {
      bookingId: "b1",
      contractId: "c1",
    });

    expect(text).toContain("http://localhost:4001/fr/account");
  });

  it("escapes HTML coming from payload values", () => {
    const { html } = renderEmail(EmailTemplate.CONTACT_MESSAGE, "fr", {
      name: '<script>alert("xss")</script>',
      email: "marie@example.com",
      message: "a & b",
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("a &amp; b");
  });

  it("ignores payload values of the wrong type instead of crashing", () => {
    const { text } = renderEmail(EmailTemplate.BOOKING_CONFIRMATION, "fr", {
      clientName: 42,
      eventDate: "not-a-date",
      quotedTotalCents: "oops",
    });

    expect(text).toContain("Bonjour,");
    expect(text).not.toContain("not-a-date");
    expect(text).not.toContain("42");
  });

  it("rejects a template the current revision does not know", () => {
    expect(() =>
      renderEmail("legacyTemplate" as EmailTemplate, "fr", {}),
    ).toThrow(/Unknown email template/);
  });

  it("renders every declared locale", () => {
    const locales: EmailLocale[] = ["fr", "nl", "en"];
    expect(EMAIL_LOCALES).toEqual(locales);
  });
});
