import { createApp } from "@src/apps/createApp";
import { UserKind } from "@src/helpers/auth/identity";
import { AUTH_ERROR_CODES } from "@src/helpers/error/constants";
import jwt from "jsonwebtoken";
import request from "supertest";

// These tests exercise the identity-aware `requireKind` middleware through a
// real protected route (`GET /api/account/me`, gated by requireClient). The
// legacy api-key/JWT-`data` strategies have been removed, so assertions track
// the current contract: a 401 carries the AUTH_* error code as its message and
// never reaches the controller without a valid identity token.
describe("authentication integration", () => {
  const app = createApp();
  const PROTECTED_ROUTE = "/api/account/me";
  const JWT_SECRET = process.env.JWT_KEY ?? "test-jwt-key";

  const signIdentity = (
    payload: Record<string, unknown>,
    secret: string = JWT_SECRET,
    expiresIn: jwt.SignOptions["expiresIn"] = "1h",
  ): string => jwt.sign(payload, secret, { expiresIn });

  // ── Missing credentials ──────────────────────────────────────────────────

  it("returns 401 when no credentials are provided to a protected route", async () => {
    const response = await request(app).get(PROTECTED_ROUTE);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AUTH_ERROR_CODES.MISSING_TOKEN);
  });

  // ── JWT / identity strategy ──────────────────────────────────────────────

  it("returns 401 when the Bearer token is malformed", async () => {
    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", "Bearer not-a-jwt");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AUTH_ERROR_CODES.INVALID_TOKEN);
  });

  it("returns 401 for an expired identity token", async () => {
    const expired = signIdentity(
      { data: "client@example.com", kind: UserKind.CLIENT, sub: "client-id" },
      JWT_SECRET,
      -1,
    );

    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", `Bearer ${expired}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AUTH_ERROR_CODES.INVALID_TOKEN);
  });

  it("returns 401 for a token signed with a wrong secret", async () => {
    const token = signIdentity(
      { data: "client@example.com", kind: UserKind.CLIENT, sub: "client-id" },
      "totally-wrong-secret",
    );

    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("returns 401 when the token has no identity shape", async () => {
    // Missing `kind`/`sub` → verifyIdentityToken rejects before kind checks.
    const token = signIdentity({ data: "client@example.com" });

    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(AUTH_ERROR_CODES.INVALID_TOKEN);
  });

  it("returns 403 when the identity kind does not match the route", async () => {
    // A valid admin token cannot satisfy a client-only route.
    const token = signIdentity({
      data: "admin@example.com",
      kind: UserKind.ADMIN,
      sub: "admin-id",
    });

    const response = await request(app)
      .get(PROTECTED_ROUTE)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(AUTH_ERROR_CODES.FORBIDDEN_KIND);
  });
});
