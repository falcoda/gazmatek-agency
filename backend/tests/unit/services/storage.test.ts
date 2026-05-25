describe("storage service", () => {
  const originalFeatureStorage = process.env.FEATURE_STORAGE;

  afterEach(() => {
    process.env.FEATURE_STORAGE = originalFeatureStorage;
    jest.resetModules();
  });

  it("returns a disabled storage service when the feature flag is off", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    await expect(
      getStorageService().saveJson("examples/latest.json", { ok: true }),
    ).resolves.toBeNull();
  });
});
