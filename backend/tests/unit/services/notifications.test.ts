// Prevent telegram.ts from calling getSharedLibConfig() at module init time
jest.mock("@lib/modules/notifier", () => ({
  notifyTeam: jest.fn(),
}));

jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn() },
}));

describe("notification service factory", () => {
  const originalEnabled = process.env.FEATURE_NOTIFICATIONS;
  const originalDriver = process.env.NOTIFICATION_DRIVER;

  afterEach(() => {
    process.env.FEATURE_NOTIFICATIONS = originalEnabled;
    process.env.NOTIFICATION_DRIVER = originalDriver;
    jest.resetModules();
  });

  it("returns a logger-based service when notifications are disabled", async () => {
    process.env.FEATURE_NOTIFICATIONS = "false";
    jest.resetModules();

    const { getNotificationService } =
      await import("@src/services/notifications");

    const service = getNotificationService();

    await expect(
      service.notify({ title: "t", message: "m" }),
    ).resolves.not.toThrow();
  });

  it("caches the service instance (singleton)", async () => {
    process.env.FEATURE_NOTIFICATIONS = "false";
    jest.resetModules();

    const { getNotificationService } =
      await import("@src/services/notifications");

    expect(getNotificationService()).toBe(getNotificationService());
  });

  it("closeNotificationService resets the singleton", async () => {
    process.env.FEATURE_NOTIFICATIONS = "false";
    jest.resetModules();

    const { getNotificationService, closeNotificationService } =
      await import("@src/services/notifications");

    const first = getNotificationService();
    await closeNotificationService();
    const second = getNotificationService();

    expect(first).not.toBe(second);
  });

  it("returns the same service instance after a second getNotificationService call", async () => {
    process.env.FEATURE_NOTIFICATIONS = "false";
    jest.resetModules();

    const { getNotificationService } =
      await import("@src/services/notifications");

    const a = getNotificationService();
    const b = getNotificationService();

    expect(a).toBe(b);
  });
});
