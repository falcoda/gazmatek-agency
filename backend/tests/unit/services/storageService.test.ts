describe("storage service (local driver)", () => {
  const originalFeatureStorage = process.env.FEATURE_STORAGE;
  const originalStorageRoot = process.env.STORAGE_LOCAL_ROOT;

  afterEach(() => {
    process.env.FEATURE_STORAGE = originalFeatureStorage;
    process.env.STORAGE_LOCAL_ROOT = originalStorageRoot;
    jest.resetModules();
  });

  it("returns a local storage service when the feature flag is on", async () => {
    process.env.FEATURE_STORAGE = "true";
    process.env.STORAGE_LOCAL_ROOT = "storage";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");
    const service = getStorageService();

    expect(service).toBeDefined();
  });

  it("caches the service instance (singleton)", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    expect(getStorageService()).toBe(getStorageService());
  });

  it("closeStorageService resets the singleton", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService, closeStorageService } =
      await import("@src/services/storage");

    const first = getStorageService();
    await closeStorageService();
    const second = getStorageService();

    expect(first).not.toBe(second);
  });
});

describe("DisabledStorageService", () => {
  const originalFeatureStorage = process.env.FEATURE_STORAGE;

  afterEach(() => {
    process.env.FEATURE_STORAGE = originalFeatureStorage;
    jest.resetModules();
  });

  it("saveText returns null", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    await expect(
      getStorageService().saveText("test.txt", "content"),
    ).resolves.toBeNull();
  });

  it("saveJson returns null", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    await expect(
      getStorageService().saveJson("test.json", { ok: true }),
    ).resolves.toBeNull();
  });

  it("readText returns null", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    await expect(getStorageService().readText("test.txt")).resolves.toBeNull();
  });

  it("readJson returns null", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    await expect(getStorageService().readJson("test.json")).resolves.toBeNull();
  });

  it("delete returns false", async () => {
    process.env.FEATURE_STORAGE = "false";
    jest.resetModules();

    const { getStorageService } = await import("@src/services/storage");

    await expect(getStorageService().delete("test.txt")).resolves.toBe(false);
  });
});
