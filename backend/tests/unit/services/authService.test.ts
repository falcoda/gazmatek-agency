// Mock argon2 before any import
jest.mock("argon2", () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

// Mock crypto to return a predictable refresh token
jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  randomBytes: jest.fn(() => Buffer.from("a".repeat(48))),
}));

// Mock pgtyped query modules
jest.mock("@src/db/query/auth/getUserByEmailWithPassword.types", () => ({
  getUserByEmailWithPassword: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/createUser.types", () => ({
  createUser: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/createRefreshToken.types", () => ({
  createRefreshToken: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/getRefreshToken.types", () => ({
  getRefreshToken: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/deleteRefreshToken.types", () => ({
  deleteRefreshToken: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/createPasswordResetToken.types", () => ({
  createPasswordResetToken: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/getPasswordResetToken.types", () => ({
  getPasswordResetToken: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/markPasswordResetTokenUsed.types", () => ({
  markPasswordResetTokenUsed: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/deleteRefreshTokensByUser.types", () => ({
  deleteRefreshTokensByUser: { run: jest.fn() },
}));
jest.mock("@src/db/query/auth/updateUserPassword.types", () => ({
  updateUserPassword: { run: jest.fn() },
}));

// Mock the mailer service
const mockMailerSend = jest.fn();
jest.mock("@src/services/mailer", () => ({
  getMailerService: jest.fn(() => ({ send: mockMailerSend })),
}));

// Mock withTransaction to run callback immediately with the pool
jest.mock("@src/db/transaction", () => ({
  withTransaction: jest.fn((_pool: unknown, cb: (c: unknown) => unknown) =>
    cb(_pool),
  ),
}));

import { createPasswordResetToken } from "@src/db/query/auth/createPasswordResetToken.types";
import { createRefreshToken } from "@src/db/query/auth/createRefreshToken.types";
import { createUser } from "@src/db/query/auth/createUser.types";
import { deleteRefreshToken } from "@src/db/query/auth/deleteRefreshToken.types";
import { deleteRefreshTokensByUser } from "@src/db/query/auth/deleteRefreshTokensByUser.types";
import { getPasswordResetToken } from "@src/db/query/auth/getPasswordResetToken.types";
import { getRefreshToken } from "@src/db/query/auth/getRefreshToken.types";
import { getUserByEmailWithPassword } from "@src/db/query/auth/getUserByEmailWithPassword.types";
import { markPasswordResetTokenUsed } from "@src/db/query/auth/markPasswordResetTokenUsed.types";
import { updateUserPassword } from "@src/db/query/auth/updateUserPassword.types";
import { hashToken } from "@src/helpers/crypto";
import { ConflictError, UnauthorizedError } from "@src/helpers/error/errors";
import { AuthService } from "@src/services/auth/authService";
import argon2 from "argon2";
import { Pool } from "pg";

const mockGetUserByEmailWithPassword =
  getUserByEmailWithPassword as jest.Mocked<typeof getUserByEmailWithPassword>;
const mockCreateUser = createUser as jest.Mocked<typeof createUser>;
const mockCreateRefreshToken = createRefreshToken as jest.Mocked<
  typeof createRefreshToken
>;
const mockGetRefreshToken = getRefreshToken as jest.Mocked<
  typeof getRefreshToken
>;
const mockDeleteRefreshToken = deleteRefreshToken as jest.Mocked<
  typeof deleteRefreshToken
>;
const mockCreatePasswordResetToken = createPasswordResetToken as jest.Mocked<
  typeof createPasswordResetToken
>;
const mockGetPasswordResetToken = getPasswordResetToken as jest.Mocked<
  typeof getPasswordResetToken
>;
const mockMarkPasswordResetTokenUsed =
  markPasswordResetTokenUsed as jest.Mocked<typeof markPasswordResetTokenUsed>;
const mockDeleteRefreshTokensByUser = deleteRefreshTokensByUser as jest.Mocked<
  typeof deleteRefreshTokensByUser
>;
const mockUpdateUserPassword = updateUserPassword as jest.Mocked<
  typeof updateUserPassword
>;
const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe("AuthService", () => {
  let service: AuthService;
  const mockPool = {} as Pool;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    service = new AuthService(mockPool);
    jest.clearAllMocks();

    // Default: createRefreshToken always succeeds
    (mockCreateRefreshToken.run as jest.Mock).mockResolvedValue([
      { token_id: "1", token: "fake-refresh-token", expires_at: expiresAt },
    ]);
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe("register()", () => {
    it("creates user and returns tokens + user info", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([]);
      (mockArgon2.hash as jest.Mock).mockResolvedValue("hashed-password");
      (mockCreateUser.run as jest.Mock).mockResolvedValue([
        { user_id: "1", email: "user@example.com", created_at: now },
      ]);

      const result = await service.register({
        email: "user@example.com",
        password: "password123",
      });

      expect(result.user).toEqual({ user_id: 1, email: "user@example.com" });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("throws ConflictError when email is already taken", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "1", email: "user@example.com", password_hash: "hash" },
      ]);

      await expect(
        service.register({
          email: "user@example.com",
          password: "password123",
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(mockCreateUser.run).not.toHaveBeenCalled();
    });

    it("hashes the password before storing", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([]);
      (mockArgon2.hash as jest.Mock).mockResolvedValue("$argon2-hash");
      (mockCreateUser.run as jest.Mock).mockResolvedValue([
        { user_id: "1", email: "user@example.com", created_at: now },
      ]);

      await service.register({
        email: "user@example.com",
        password: "my-password",
      });

      expect(mockArgon2.hash).toHaveBeenCalledWith("my-password");
      const createUserCall = (mockCreateUser.run as jest.Mock).mock.calls[0][0];
      expect(createUserCall.passwordHash).toBe("$argon2-hash");
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe("login()", () => {
    it("returns tokens + user info on valid credentials", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "2", email: "user@example.com", password_hash: "hash" },
      ]);
      (mockArgon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: "user@example.com",
        password: "correct-password",
      });

      expect(result.user).toEqual({ user_id: 2, email: "user@example.com" });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("stores the hashed refresh token, not the raw value", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "2", email: "user@example.com", password_hash: "hash" },
      ]);
      (mockArgon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: "user@example.com",
        password: "correct-password",
      });

      const storedToken = (mockCreateRefreshToken.run as jest.Mock).mock
        .calls[0][0].token as string;
      // The DB only ever receives the SHA-256 hash
      expect(storedToken).toBe(hashToken(result.refreshToken));
      expect(storedToken).not.toBe(result.refreshToken);
    });

    it("throws UnauthorizedError when user not found", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.login({ email: "unknown@example.com", password: "any" }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws UnauthorizedError when password is wrong", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "1", email: "user@example.com", password_hash: "hash" },
      ]);
      (mockArgon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: "user@example.com", password: "wrong" }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws UnauthorizedError when password_hash is null", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "1", email: "user@example.com", password_hash: null },
      ]);

      await expect(
        service.login({ email: "user@example.com", password: "any" }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  describe("refresh()", () => {
    it("returns new token pair on valid refresh token", async () => {
      (mockGetRefreshToken.run as jest.Mock).mockResolvedValue([
        {
          token_id: "5",
          user_id: "1",
          token: "valid-refresh-token",
          email: "user@example.com",
          expires_at: expiresAt,
        },
      ]);
      (mockDeleteRefreshToken.run as jest.Mock).mockResolvedValue([
        { token_id: "5" },
      ]);

      const result = await service.refresh("valid-refresh-token");

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // The DB is queried with the SHA-256 hash, never the raw token
      expect(mockGetRefreshToken.run).toHaveBeenCalledWith(
        { token: hashToken("valid-refresh-token") },
        mockPool,
      );
      // Old token must be deleted (rotation), looked up by its hash
      expect(mockDeleteRefreshToken.run).toHaveBeenCalledWith(
        { token: hashToken("valid-refresh-token") },
        mockPool,
      );
    });

    it("throws UnauthorizedError on invalid or expired token", async () => {
      (mockGetRefreshToken.run as jest.Mock).mockResolvedValue([]);

      await expect(service.refresh("bad-token")).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it("issues a new refresh token (rotation — old one deleted)", async () => {
      (mockGetRefreshToken.run as jest.Mock).mockResolvedValue([
        {
          token_id: "3",
          user_id: "1",
          token: "old-token",
          email: "user@example.com",
          expires_at: expiresAt,
        },
      ]);
      (mockDeleteRefreshToken.run as jest.Mock).mockResolvedValue([
        { token_id: "3" },
      ]);

      await service.refresh("old-token");

      expect(mockDeleteRefreshToken.run).toHaveBeenCalled();
      expect(mockCreateRefreshToken.run).toHaveBeenCalled();
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────

  describe("logout()", () => {
    it("deletes the refresh token", async () => {
      (mockDeleteRefreshToken.run as jest.Mock).mockResolvedValue([
        { token_id: "1" },
      ]);

      await service.logout("some-refresh-token");

      // The raw token is hashed before it ever reaches the DB layer
      expect(mockDeleteRefreshToken.run).toHaveBeenCalledWith(
        { token: hashToken("some-refresh-token") },
        mockPool,
      );
    });

    it("does not throw when token does not exist", async () => {
      (mockDeleteRefreshToken.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.logout("nonexistent-token"),
      ).resolves.toBeUndefined();
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────

  describe("forgotPassword()", () => {
    it("returns silently when no user matches (no token, no mail)", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.forgotPassword({ email: "unknown@example.com" }),
      ).resolves.toBeUndefined();

      expect(mockCreatePasswordResetToken.run).not.toHaveBeenCalled();
      expect(mockMailerSend).not.toHaveBeenCalled();
    });

    it("creates a reset token storing the hash and sends the email", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "7", email: "user@example.com", password_hash: "hash" },
      ]);
      (mockCreatePasswordResetToken.run as jest.Mock).mockResolvedValue([
        { token_id: "1" },
      ]);
      mockMailerSend.mockResolvedValue(undefined);

      await service.forgotPassword({ email: "user@example.com" });

      expect(mockCreatePasswordResetToken.run).toHaveBeenCalledTimes(1);
      const storedArgs = (mockCreatePasswordResetToken.run as jest.Mock).mock
        .calls[0][0];
      // crypto.randomBytes is mocked, so the raw token is deterministic
      const rawToken = Buffer.from("a".repeat(48)).toString("hex");
      expect(storedArgs.userId).toBe("7");
      // The DB only ever receives the SHA-256 hash, never the raw token
      expect(storedArgs.token).toBe(hashToken(rawToken));
      expect(storedArgs.token).not.toBe(rawToken);
      expect(storedArgs.expiresAt).toBeInstanceOf(Date);

      expect(mockMailerSend).toHaveBeenCalledTimes(1);
      const mailPayload = mockMailerSend.mock.calls[0][0];
      expect(mailPayload.to).toBe("user@example.com");
      expect(mailPayload.subject).toBe("Password reset request");
    });

    it("does not store the raw token in the database", async () => {
      (mockGetUserByEmailWithPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "7", email: "user@example.com", password_hash: "hash" },
      ]);
      (mockCreatePasswordResetToken.run as jest.Mock).mockResolvedValue([
        { token_id: "1" },
      ]);
      mockMailerSend.mockResolvedValue(undefined);

      await service.forgotPassword({ email: "user@example.com" });

      const storedToken = (mockCreatePasswordResetToken.run as jest.Mock).mock
        .calls[0][0].token as string;
      // A SHA-256 hex digest is 64 characters long
      expect(storedToken).toHaveLength(64);
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────

  describe("resetPassword()", () => {
    it("throws UnauthorizedError when the reset token is unknown", async () => {
      (mockGetPasswordResetToken.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.resetPassword({
          token: "bad-token",
          newPassword: "new-password",
        }),
      ).rejects.toBeInstanceOf(UnauthorizedError);

      expect(mockUpdateUserPassword.run).not.toHaveBeenCalled();
      expect(mockMarkPasswordResetTokenUsed.run).not.toHaveBeenCalled();
      expect(mockDeleteRefreshTokensByUser.run).not.toHaveBeenCalled();
    });

    it("hashes the new password and updates it on a valid token", async () => {
      (mockGetPasswordResetToken.run as jest.Mock).mockResolvedValue([
        { token_id: "1", user_id: "9" },
      ]);
      (mockArgon2.hash as jest.Mock).mockResolvedValue("$argon2-new-hash");
      (mockUpdateUserPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "9" },
      ]);
      (mockMarkPasswordResetTokenUsed.run as jest.Mock).mockResolvedValue([
        { token_id: "1" },
      ]);
      (mockDeleteRefreshTokensByUser.run as jest.Mock).mockResolvedValue([]);

      await service.resetPassword({
        token: "valid-token",
        newPassword: "my-new-password",
      });

      expect(mockArgon2.hash).toHaveBeenCalledWith("my-new-password");
      const updateArgs = (mockUpdateUserPassword.run as jest.Mock).mock
        .calls[0][0];
      expect(updateArgs.passwordHash).toBe("$argon2-new-hash");
      expect(updateArgs.userId).toBe(9);
    });

    it("updates the password, marks the token used and revokes refresh tokens", async () => {
      (mockGetPasswordResetToken.run as jest.Mock).mockResolvedValue([
        { token_id: "1", user_id: "9" },
      ]);
      (mockArgon2.hash as jest.Mock).mockResolvedValue("$argon2-new-hash");
      (mockUpdateUserPassword.run as jest.Mock).mockResolvedValue([
        { user_id: "9" },
      ]);
      (mockMarkPasswordResetTokenUsed.run as jest.Mock).mockResolvedValue([
        { token_id: "1" },
      ]);
      (mockDeleteRefreshTokensByUser.run as jest.Mock).mockResolvedValue([]);

      await service.resetPassword({
        token: "valid-token",
        newPassword: "my-new-password",
      });

      expect(mockUpdateUserPassword.run).toHaveBeenCalledTimes(1);
      expect(mockMarkPasswordResetTokenUsed.run).toHaveBeenCalledTimes(1);
      expect(mockDeleteRefreshTokensByUser.run).toHaveBeenCalledTimes(1);
      // The token used for lookup is the hash, not the raw value
      expect(mockMarkPasswordResetTokenUsed.run).toHaveBeenCalledWith(
        { token: hashToken("valid-token") },
        mockPool,
      );
      expect(mockDeleteRefreshTokensByUser.run).toHaveBeenCalledWith(
        { userId: 9 },
        mockPool,
      );
    });
  });
});
