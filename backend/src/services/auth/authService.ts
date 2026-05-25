import {
  AuthTokensResponse,
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from "@src/controllers/auth/types";
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
import { withTransaction } from "@src/db/transaction";
import { config } from "@src/helpers/config";
import { JWT_EXPIRES } from "@src/helpers/constants";
import { hashToken } from "@src/helpers/crypto";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import {
  ConflictError,
  DatabaseError,
  UnauthorizedError,
} from "@src/helpers/error/errors";
import { getMailerService } from "@src/services/mailer";
import argon2 from "argon2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const PASSWORD_RESET_EXPIRES_IN_HOURS = 1;

export class AuthService {
  constructor(private db: Pool) {}

  private signAccessToken(email: string): string {
    return jwt.sign({ data: email }, config.jwt.key, {
      expiresIn: JWT_EXPIRES.ACCESS,
    });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(48).toString("hex");
  }

  private refreshTokenExpiresAt(): Date {
    const date = new Date();
    date.setDate(date.getDate() + JWT_EXPIRES.REFRESH_DAYS);
    return date;
  }

  private async issueTokenPair(
    userId: number | string,
    email: string,
  ): Promise<AuthTokensResponse> {
    const accessToken = this.signAccessToken(email);
    const refreshToken = this.generateRefreshToken();
    const expiresAt = this.refreshTokenExpiresAt();

    await createRefreshToken.run(
      { userId, token: hashToken(refreshToken), expiresAt },
      this.db,
    );

    return { accessToken, refreshToken };
  }

  async register(
    body: RegisterBody,
  ): Promise<
    AuthTokensResponse & { user: { user_id: number; email: string } }
  > {
    const existing = await getUserByEmailWithPassword.run(
      { email: body.email },
      this.db,
    );

    if (existing.length > 0) {
      throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const passwordHash = await argon2.hash(body.password);

    return withTransaction(this.db, async (client) => {
      const rows = await createUser.run(
        { email: body.email, passwordHash },
        client,
      );

      if (rows.length === 0) {
        throw new DatabaseError();
      }

      const user = rows[0];
      const userId = Number(user.user_id);

      const tokens = await this.issueTokenPair(userId, user.email);

      return {
        ...tokens,
        user: { user_id: userId, email: user.email },
      };
    });
  }

  async login(
    body: LoginBody,
  ): Promise<
    AuthTokensResponse & { user: { user_id: number; email: string } }
  > {
    const rows = await getUserByEmailWithPassword.run(
      { email: body.email },
      this.db,
    );

    if (rows.length === 0 || !rows[0].password_hash) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const user = rows[0];
    const hash = user.password_hash;

    if (!hash) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isValid = await argon2.verify(hash, body.password);

    if (!isValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const userId = Number(user.user_id);
    const tokens = await this.issueTokenPair(userId, user.email);

    return {
      ...tokens,
      user: { user_id: userId, email: user.email },
    };
  }

  async refresh(token: string): Promise<AuthTokensResponse> {
    const tokenHash = hashToken(token);
    const rows = await getRefreshToken.run({ token: tokenHash }, this.db);

    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const record = rows[0];

    // Token rotation: delete old, issue new pair
    await deleteRefreshToken.run({ token: tokenHash }, this.db);

    return this.issueTokenPair(record.user_id, record.email);
  }

  async logout(token: string): Promise<void> {
    await deleteRefreshToken.run({ token: hashToken(token) }, this.db);
  }

  private passwordResetExpiresAt(): Date {
    const date = new Date();
    date.setHours(date.getHours() + PASSWORD_RESET_EXPIRES_IN_HOURS);
    return date;
  }

  private buildPasswordResetLink(token: string): string {
    const baseUrl = config.app.baseUrl.replace(/\/$/, "");

    return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  /**
   * Issues a single-use password reset token and emails the reset link.
   * Returns silently when no account matches, to avoid account enumeration.
   */
  async forgotPassword(body: ForgotPasswordBody): Promise<void> {
    const rows = await getUserByEmailWithPassword.run(
      { email: body.email },
      this.db,
    );

    if (rows.length === 0) {
      return;
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");

    await createPasswordResetToken.run(
      {
        userId: user.user_id,
        token: hashToken(token),
        expiresAt: this.passwordResetExpiresAt(),
      },
      this.db,
    );

    const resetLink = this.buildPasswordResetLink(token);

    await getMailerService().send({
      to: user.email,
      subject: "Password reset request",
      text: `A password reset was requested for your account. Use the link below within ${PASSWORD_RESET_EXPIRES_IN_HOURS} hour to choose a new password:\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.`,
    });
  }

  /**
   * Consumes a password reset token: updates the password, marks the token
   * used, and revokes every refresh token so other sessions are logged out.
   */
  async resetPassword(body: ResetPasswordBody): Promise<void> {
    const tokenHash = hashToken(body.token);
    const rows = await getPasswordResetToken.run({ token: tokenHash }, this.db);

    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_RESET_TOKEN);
    }

    const passwordHash = await argon2.hash(body.newPassword);
    const userId = Number(rows[0].user_id);

    await withTransaction(this.db, async (client) => {
      await updateUserPassword.run({ passwordHash, userId }, client);
      await markPasswordResetTokenUsed.run({ token: tokenHash }, client);
      await deleteRefreshTokensByUser.run({ userId }, client);
    });
  }
}

export default AuthService;
