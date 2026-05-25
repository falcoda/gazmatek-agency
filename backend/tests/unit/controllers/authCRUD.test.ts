jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn() },
}));

import { AuthCRUD } from "@src/controllers/auth/authCRUD";
import { ConflictError, UnauthorizedError } from "@src/helpers/error/errors";
import AuthService from "@src/services/auth/authService";
import type { NextFunction, Response } from "express";

const makeRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const makeMockService = (): jest.Mocked<AuthService> =>
  ({
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  }) as unknown as jest.Mocked<AuthService>;

describe("AuthCRUD", () => {
  let mockService: jest.Mocked<AuthService>;
  let crud: AuthCRUD;
  const next = jest.fn() as NextFunction;

  const tokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    user: { user_id: 1, email: "user@example.com" },
  };

  beforeEach(() => {
    mockService = makeMockService();
    crud = new AuthCRUD(mockService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register ──────────────────────────────────────────────────────────────

  describe("register()", () => {
    it("returns 201 with tokens and user info on success", async () => {
      mockService.register.mockResolvedValue(tokens);

      const req = {
        body: { email: "user@example.com", password: "password123" },
      } as unknown as Parameters<typeof crud.register>[0];
      const res = makeRes();

      await crud.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(tokens);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(ConflictError) when email is taken", async () => {
      mockService.register.mockRejectedValue(new ConflictError("Email taken"));

      const req = {
        body: { email: "taken@example.com", password: "password123" },
      } as unknown as Parameters<typeof crud.register>[0];

      await crud.register(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ConflictError));
    });

    it("calls next(error) on unexpected error", async () => {
      mockService.register.mockRejectedValue(new Error("unexpected"));
      const req = {
        body: { email: "x@x.com", password: "pass" },
      } as unknown as Parameters<typeof crud.register>[0];

      await crud.register(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe("login()", () => {
    it("returns 200 with tokens and user info on valid credentials", async () => {
      mockService.login.mockResolvedValue(tokens);

      const req = {
        body: { email: "user@example.com", password: "correct" },
      } as unknown as Parameters<typeof crud.login>[0];
      const res = makeRes();

      await crud.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tokens);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(UnauthorizedError) on invalid credentials", async () => {
      mockService.login.mockRejectedValue(
        new UnauthorizedError("Invalid credentials"),
      );

      const req = {
        body: { email: "user@example.com", password: "wrong" },
      } as unknown as Parameters<typeof crud.login>[0];

      await crud.login(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  describe("refresh()", () => {
    it("returns 200 with new token pair", async () => {
      const newTokens = {
        accessToken: "new-access",
        refreshToken: "new-refresh",
      };
      mockService.refresh.mockResolvedValue(newTokens);

      const req = {
        body: { refreshToken: "old-refresh-token" },
      } as unknown as Parameters<typeof crud.refresh>[0];
      const res = makeRes();

      await crud.refresh(req, res, next);

      expect(mockService.refresh).toHaveBeenCalledWith("old-refresh-token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(newTokens);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(UnauthorizedError) on invalid refresh token", async () => {
      mockService.refresh.mockRejectedValue(
        new UnauthorizedError("Invalid token"),
      );

      const req = {
        body: { refreshToken: "bad-token" },
      } as unknown as Parameters<typeof crud.refresh>[0];

      await crud.refresh(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe("logout()", () => {
    it("returns 200 with success message", async () => {
      mockService.logout.mockResolvedValue(undefined);

      const req = {
        body: { refreshToken: "some-refresh-token" },
        user_id: 1,
      } as unknown as Parameters<typeof crud.logout>[0];
      const res = makeRes();

      await crud.logout(req, res, next);

      expect(mockService.logout).toHaveBeenCalledWith("some-refresh-token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) on unexpected error", async () => {
      mockService.logout.mockRejectedValue(new Error("db error"));
      const req = {
        body: { refreshToken: "token" },
      } as unknown as Parameters<typeof crud.logout>[0];

      await crud.logout(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────

  describe("forgotPassword()", () => {
    it("returns 200 with a message and calls the service", async () => {
      mockService.forgotPassword.mockResolvedValue(undefined);

      const req = {
        body: { email: "user@example.com" },
      } as unknown as Parameters<typeof crud.forgotPassword>[0];
      const res = makeRes();

      await crud.forgotPassword(req, res, next);

      expect(mockService.forgotPassword).toHaveBeenCalledWith({
        email: "user@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) on unexpected error", async () => {
      mockService.forgotPassword.mockRejectedValue(new Error("mailer down"));

      const req = {
        body: { email: "user@example.com" },
      } as unknown as Parameters<typeof crud.forgotPassword>[0];

      await crud.forgotPassword(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────

  describe("resetPassword()", () => {
    it("returns 200 with a message and calls the service", async () => {
      mockService.resetPassword.mockResolvedValue(undefined);

      const req = {
        body: { token: "valid-token", newPassword: "new-password" },
      } as unknown as Parameters<typeof crud.resetPassword>[0];
      const res = makeRes();

      await crud.resetPassword(req, res, next);

      expect(mockService.resetPassword).toHaveBeenCalledWith({
        token: "valid-token",
        newPassword: "new-password",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(UnauthorizedError) on an invalid reset token", async () => {
      mockService.resetPassword.mockRejectedValue(
        new UnauthorizedError("Invalid or expired reset token"),
      );

      const req = {
        body: { token: "bad-token", newPassword: "new-password" },
      } as unknown as Parameters<typeof crud.resetPassword>[0];

      await crud.resetPassword(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
});
