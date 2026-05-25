import request from "supertest";

describe("api rate limiting", () => {
  const originalMaxApi = process.env.RATE_LIMIT_MAX_API;

  beforeAll(() => {
    jest.resetModules();
    process.env.RATE_LIMIT_MAX_API = "2";
  });

  afterAll(() => {
    process.env.RATE_LIMIT_MAX_API = originalMaxApi;
  });

  it("returns 429 after the configured number of requests", async () => {
    const { createApp } = await import("@src/apps/createApp");
    const app = createApp();

    await request(app).get("/api/unknown-route").expect(404);
    await request(app).get("/api/unknown-route").expect(404);

    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(429);
    expect(response.body.message).toBe("Too many API requests");
  });

  it("does not apply the global api limiter to health probes", async () => {
    const { createApp } = await import("@src/apps/createApp");
    const app = createApp();

    await request(app).get("/api/health/live").expect(200);
    await request(app).get("/api/health/live").expect(200);
    await request(app).get("/api/health/live").expect(200);
  });
});
