// Mock functions must be defined before jest.mock (they are captured by closure)
const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockRefresh = jest.fn();
const mockLogout = jest.fn();

// Factory mock: AuthService constructor returns an object with our mock fns
jest.mock("@src/services/auth/authService", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    register: mockRegister,
    login: mockLogin,
    refresh: mockRefresh,
    logout: mockLogout,
  })),
}));

import { createApp } from "@src/apps/createApp";
import { ConflictError, UnauthorizedError } from "@src/helpers/error/errors";
import request from "supertest";

const app = createApp();

const tokens = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: { user_id: 1, email: "user@example.com" },
};

describe("Auth endpoints integration", () => {
  afterEach(() => jest.clearAllMocks());

  // ── POST /api/auth/register ────────────────────────────────────────────────

  describe("POST /api/auth/register", () => {
    it("returns 201 with tokens on valid body", async () => {
      mockRegister.mockResolvedValue(tokens);

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "user@example.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user).toMatchObject({ email: "user@example.com" });
    });

    it("returns 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ password: "password123" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "user@example.com", password: "short" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when email is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", password: "password123" });

      expect(res.status).toBe(400);
    });

    it("returns 409 when email is already taken", async () => {
      mockRegister.mockRejectedValue(new ConflictError("Email taken"));

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "taken@example.com", password: "password123" });

      expect(res.status).toBe(409);
    });
  });

  // ── POST /api/auth/login ───────────────────────────────────────────────────

  describe("POST /api/auth/login", () => {
    it("returns 200 with tokens on valid credentials", async () => {
      mockLogin.mockResolvedValue(tokens);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "correct" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("returns 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "password" });

      expect(res.status).toBe(400);
    });

    it("returns 401 on invalid credentials", async () => {
      mockLogin.mockRejectedValue(new UnauthorizedError("Invalid credentials"));

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "wrong" });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/auth/refresh ─────────────────────────────────────────────────

  describe("POST /api/auth/refresh", () => {
    it("returns 200 with new token pair", async () => {
      const newTokens = {
        accessToken: "new-access",
        refreshToken: "new-refresh",
      };
      mockRefresh.mockResolvedValue(newTokens);

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "valid-refresh-token" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken", "new-access");
      expect(res.body).toHaveProperty("refreshToken", "new-refresh");
    });

    it("returns 400 when refreshToken is missing", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});

      expect(res.status).toBe(400);
    });

    it("returns 401 on invalid or expired refresh token", async () => {
      mockRefresh.mockRejectedValue(new UnauthorizedError("Invalid token"));

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "bad-token" });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/auth/logout ──────────────────────────────────────────────────

  describe("POST /api/auth/logout", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: "some-token" });

      expect(res.status).toBe(401);
    });
  });
});
