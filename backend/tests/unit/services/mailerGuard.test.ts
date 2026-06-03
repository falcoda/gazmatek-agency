jest.mock("@src/helpers/logger", () => ({
  logger: { warn: jest.fn() },
}));

import { logger } from "@src/helpers/logger";
import { GuardedMailerService } from "@src/services/mailer/drivers/guarded";
import { isReservedEmailRecipient } from "@src/services/mailer/reservedDomains";
import { MailerService } from "@src/services/mailer/types";

describe("isReservedEmailRecipient", () => {
  it.each([
    "template@example.com",
    "Sarah.Dubois@Example.COM",
    "user@mail.example.com",
    "user@example.net",
    "user@example.org",
    "user@example.edu",
    "user@foo.test",
    "user@bar.invalid",
    "user@anything.example",
    "user@localhost",
  ])("flags reserved recipient %s", (recipient) => {
    expect(isReservedEmailRecipient(recipient)).toBe(true);
  });

  it.each([
    "office@aksarasystems.com",
    "client@gazmatek.com",
    "user@example.company.com",
    "not-an-email",
    "user@",
  ])("allows real recipient %s", (recipient) => {
    expect(isReservedEmailRecipient(recipient)).toBe(false);
  });
});

describe("GuardedMailerService", () => {
  const buildInner = () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);
    const inner: MailerService = { send, close };
    return { inner, send, close };
  };

  beforeEach(() => {
    (logger.warn as jest.Mock).mockClear();
  });

  it("skips delivery to a reserved domain and logs a warning", async () => {
    const { inner, send } = buildInner();
    const guarded = new GuardedMailerService(inner);

    await guarded.send({
      to: "template@example.com",
      subject: "s",
      text: "t",
    });

    expect(send).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("delegates delivery to a real recipient", async () => {
    const { inner, send } = buildInner();
    const guarded = new GuardedMailerService(inner);
    const payload = {
      to: "office@aksarasystems.com",
      subject: "s",
      text: "t",
    };

    await guarded.send(payload);

    expect(send).toHaveBeenCalledWith(payload);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("forwards close to the inner driver", async () => {
    const { inner, close } = buildInner();
    const guarded = new GuardedMailerService(inner);

    await guarded.close();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
