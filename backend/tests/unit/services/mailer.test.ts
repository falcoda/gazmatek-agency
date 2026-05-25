jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn() },
}));

describe("mailer service factory", () => {
  const originalEnabled = process.env.FEATURE_MAILER;
  const originalDriver = process.env.MAILER_DRIVER;

  afterEach(() => {
    process.env.FEATURE_MAILER = originalEnabled;
    process.env.MAILER_DRIVER = originalDriver;
    jest.resetModules();
  });

  it("returns a logger-based service when mailer is disabled", async () => {
    process.env.FEATURE_MAILER = "false";
    jest.resetModules();

    const { getMailerService } = await import("@src/services/mailer");
    const service = getMailerService();

    await expect(
      service.send({ to: "a@b.com", subject: "s", text: "t" }),
    ).resolves.not.toThrow();
  });

  it("caches the service instance (singleton)", async () => {
    process.env.FEATURE_MAILER = "false";
    jest.resetModules();

    const { getMailerService } = await import("@src/services/mailer");

    expect(getMailerService()).toBe(getMailerService());
  });

  it("closeMailerService resets the singleton", async () => {
    process.env.FEATURE_MAILER = "false";
    jest.resetModules();

    const { getMailerService, closeMailerService } =
      await import("@src/services/mailer");

    const first = getMailerService();
    await closeMailerService();
    const second = getMailerService();

    expect(first).not.toBe(second);
  });

  it("close on logger mailer is a no-op", async () => {
    process.env.FEATURE_MAILER = "false";
    jest.resetModules();

    const { getMailerService, closeMailerService } =
      await import("@src/services/mailer");

    getMailerService();

    await expect(closeMailerService()).resolves.not.toThrow();
  });
});
