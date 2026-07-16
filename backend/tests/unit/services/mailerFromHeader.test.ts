describe("buildFromHeader", () => {
  const originalAppName = process.env.APP_NAME;
  const originalFrom = process.env.MAILER_FROM;

  afterEach(() => {
    process.env.APP_NAME = originalAppName;
    process.env.MAILER_FROM = originalFrom;
    jest.resetModules();
  });

  const loadHeader = async (): Promise<string> => {
    jest.resetModules();
    const { buildFromHeader } = await import("@src/services/mailer/fromHeader");
    return buildFromHeader();
  };

  it("shows the app name instead of the bare address local part", async () => {
    process.env.APP_NAME = "gazmatek-agency";
    process.env.MAILER_FROM = "no-reply@gazmatek.com";

    // Without this, clients display the sender as "no-reply".
    expect(await loadHeader()).toBe(
      '"Gazmatek Agency" <no-reply@gazmatek.com>',
    );
  });

  it("capitalizes each hyphen-separated word of APP_NAME", async () => {
    process.env.APP_NAME = "gazmatek";
    process.env.MAILER_FROM = "no-reply@gazmatek.com";

    expect(await loadHeader()).toBe('"Gazmatek" <no-reply@gazmatek.com>');
  });

  it("keeps a MAILER_FROM that already carries its own display name", async () => {
    process.env.APP_NAME = "gazmatek-agency";
    process.env.MAILER_FROM = "Booking Team <hello@gazmatek.com>";

    expect(await loadHeader()).toBe("Booking Team <hello@gazmatek.com>");
  });

  it("escapes quotes so the header cannot be broken by APP_NAME", async () => {
    process.env.APP_NAME = 'gaz"matek';
    process.env.MAILER_FROM = "no-reply@gazmatek.com";

    expect(await loadHeader()).toBe('"Gaz\\"matek" <no-reply@gazmatek.com>');
  });
});
