const enqueue = jest.fn();

// Mocked wholesale so the test never reaches the queue's DB pool. The service
// only pulls `getEmailQueue` from here; its constants come from emailConstants.
jest.mock("@src/services/mailer/queueService", () => ({
  getEmailQueue: () => ({ enqueue }),
}));

jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { EmailTemplate } from "@src/services/mailer/emailConstants";

const VALID_INPUT = {
  name: "Marie Dupont",
  email: "marie@example.com",
  subject: "Réservation pour un mariage",
  message: "Bonjour, je souhaite réserver un artiste.",
  locale: "nl" as const,
};

const loadService = async (defaultTo: string) => {
  process.env.MAILER_DEFAULT_TO = defaultTo;
  jest.resetModules();
  const { ContactService } =
    await import("@src/services/contact/contactService");
  return new ContactService();
};

describe("ContactService", () => {
  const originalDefaultTo = process.env.MAILER_DEFAULT_TO;
  const originalFrom = process.env.MAILER_FROM;

  beforeEach(() => {
    enqueue.mockClear();
  });

  afterEach(() => {
    process.env.MAILER_DEFAULT_TO = originalDefaultTo;
    process.env.MAILER_FROM = originalFrom;
    jest.resetModules();
  });

  it("queues the team notification and the sender acknowledgement", async () => {
    const service = await loadService("team@gazmatek.com");

    const result = await service.sendMessage(VALID_INPUT);

    expect(result).toEqual({ delivered: true });
    expect(enqueue).toHaveBeenCalledTimes(2);

    expect(enqueue).toHaveBeenNthCalledWith(1, {
      template: EmailTemplate.CONTACT_MESSAGE,
      recipient: "team@gazmatek.com",
      // The team notification is internal: default locale, not the visitor's.
      locale: "fr",
      payload: {
        name: VALID_INPUT.name,
        email: VALID_INPUT.email,
        subject: VALID_INPUT.subject,
        message: VALID_INPUT.message,
      },
    });

    expect(enqueue).toHaveBeenNthCalledWith(2, {
      template: EmailTemplate.CONTACT_ACK,
      recipient: VALID_INPUT.email,
      locale: "nl",
      payload: { name: VALID_INPUT.name },
    });
  });

  it("sends the team notification to every configured recipient", async () => {
    const service = await loadService("a@gazmatek.com,b@gazmatek.com");

    await service.sendMessage(VALID_INPUT);

    expect(enqueue).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ recipient: "a@gazmatek.com, b@gazmatek.com" }),
    );
  });

  it("queues nothing when no recipient is configured", async () => {
    process.env.MAILER_FROM = "";
    const service = await loadService("");

    const result = await service.sendMessage(VALID_INPUT);

    expect(result).toEqual({ delivered: false });
    expect(enqueue).not.toHaveBeenCalled();
  });
});
