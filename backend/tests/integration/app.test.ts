jest.mock("@src/db/query/auth/getUserByApiKey.types", () => ({
  getUserByApiKey: {
    run: jest.fn().mockImplementation((params: { apiKey: string }) => {
      if (params.apiKey === "test-api-key") {
        return Promise.resolve([{ user_id: 1, email: "test@example.com" }]);
      }
      return Promise.resolve([]);
    }),
  },
}));

import { createApp } from "@src/apps/createApp";
import request from "supertest";

describe("backend template integration", () => {
  const app = createApp();

  it("returns liveness payload", async () => {
    const response = await request(app).get("/api/health/live");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("alive");
    expect(response.body.service).toBe("backend-template-test");
  });

  it("exposes swagger json", async () => {
    const response = await request(app).get("/docs/json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.0");
    expect(response.body.info.title).toBe("Backend Template API");
  });

  it("returns a request id on not found routes", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
    expect(response.body.requestId).toBeDefined();
  });

  it("exposes prometheus metrics at /metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/plain/);
    expect(response.text).toContain("nodejs_version_info");
  });
});
