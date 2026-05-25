import { createApp } from "@src/apps/createApp";
import jwt from "jsonwebtoken";
import request from "supertest";

describe("authentication integration", () => {
  const app = createApp();

  // ── Missing credentials ──────────────────────────────────────────────────

  it("returns 401 when no credentials are provided to a protected route", async () => {
    const response = await request(app).get("/api/example");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  // ── API-key strategy ────────────────────────────────────────────────────

  it("returns 401 when the API key header value is wrong", async () => {
    const response = await request(app)
      .get("/api/example")
      .set("x-api-key", "wrong-key");

    expect(response.status).toBe(401);
  });

  it("returns 401 with configured api key when no DB ownership exists", async () => {
    const response = await request(app)
      .post("/api/example")
      .set("x-api-key", "test-api-key")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("returns 401 with ApiKey Authorization when no DB ownership exists", async () => {
    const response = await request(app)
      .post("/api/example")
      .set("Authorization", "ApiKey test-api-key")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("returns 401 when the ApiKey scheme has an invalid key", async () => {
    const response = await request(app)
      .get("/api/example")
      .set("Authorization", "ApiKey bad-key");

    expect(response.status).toBe(401);
  });

  // ── JWT strategy ────────────────────────────────────────────────────────

  it("returns 401 when the Bearer token is malformed", async () => {
    const response = await request(app)
      .get("/api/example")
      .set("Authorization", "Bearer not-a-jwt");

    // JWT strategy throws JsonWebTokenError → catch maps to 401
    expect(response.status).toBe(401);
    expect(response.body.details).not.toEqual({ resetToken: true });
  });

  it("returns 401 with resetToken: true for an expired JWT", async () => {
    const expired = jwt.sign(
      { sub: "user@example.com" },
      process.env.JWT_KEY ?? "test-jwt-key",
      { expiresIn: -1 },
    );

    const response = await request(app)
      .get("/api/example")
      .set("Authorization", `Bearer ${expired}`);

    expect(response.status).toBe(401);
    expect(response.body.details).toEqual({ resetToken: true });
  });

  it("passes auth with a valid JWT — reaches validation layer", async () => {
    // JWT strategy expects payload.data to hold the email
    const token = jwt.sign(
      { data: "user@example.com" },
      process.env.JWT_KEY ?? "test-jwt-key",
      { expiresIn: "1h" },
    );

    // Auth passes but DB lookup fails → 500 (not a 401 auth rejection)
    const response = await request(app)
      .post("/api/example")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).not.toBe(401);
  });

  it("returns 401 for JWT signed with a wrong secret", async () => {
    const token = jwt.sign(
      { sub: "user@example.com" },
      "totally-wrong-secret",
      { expiresIn: "1h" },
    );

    const response = await request(app)
      .get("/api/example")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
