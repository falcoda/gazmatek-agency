import { consumeArtistPasswordResetToken } from "@src/db/query/artistAccount/consumeArtistPasswordResetToken.types";
import { getArtistAccountByEmail } from "@src/db/query/artistAccount/getArtistAccountByEmail.types";
import { getArtistAccountById } from "@src/db/query/artistAccount/getArtistAccountById.types";
import { incrementArtistFailedAttempts } from "@src/db/query/artistAccount/incrementArtistFailedAttempts.types";
import { resetArtistFailedAttempts } from "@src/db/query/artistAccount/resetArtistFailedAttempts.types";
import { setArtistPasswordResetToken } from "@src/db/query/artistAccount/setArtistPasswordResetToken.types";
import { recordAudit } from "@src/helpers/audit";
import { signIdentityToken, UserKind } from "@src/helpers/auth/identity";
import { hashPassword, verifyPassword } from "@src/helpers/auth/password";
import { generateRawToken, hashToken } from "@src/helpers/auth/tokens";
import { config } from "@src/helpers/config";
import {
  AUDIT_ACTION,
  AUDIT_ACTOR_KIND,
  AUDIT_TARGET_KIND,
  IDENTITY_KIND,
} from "@src/helpers/constants/domain";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import { ForbiddenError, UnauthorizedError } from "@src/helpers/error/errors";
import {
  consumeRefreshToken,
  issueRefreshToken,
  revokeRefreshToken,
} from "@src/services/auth/identityRefreshService";
import {
  EmailLocale,
  EmailTemplate,
  getEmailQueue,
} from "@src/services/mailer/queueService";
import { Pool } from "pg";

// One hour: a password-reset link must be short-lived to limit the blast
// radius if an email is intercepted.
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export interface ArtistIdentity {
  id: string;
  email: string;
  slug: string;
  stageName: string;
}

export interface ArtistLoginResult {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  artist: ArtistIdentity;
}

export type ArtistRefreshResult = ArtistLoginResult;

export class ArtistAuthService {
  constructor(private db: Pool) {}

  async login(email: string, password: string): Promise<ArtistLoginResult> {
    const rows = await getArtistAccountByEmail.run(
      { email: email.toLowerCase() },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const account = rows[0];

    if (!account.is_active) {
      throw new ForbiddenError("Account disabled");
    }
    if (account.locked_until && account.locked_until.getTime() > Date.now()) {
      throw new ForbiddenError("Account temporarily locked");
    }

    const ok = await verifyPassword(account.password_hash, password);
    if (!ok) {
      await incrementArtistFailedAttempts.run(
        { artistId: account.artist_id },
        this.db,
      );
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    await resetArtistFailedAttempts.run(
      { artistId: account.artist_id },
      this.db,
    );

    const signed = signIdentityToken({
      data: account.email,
      kind: UserKind.ARTIST,
      sub: account.artist_id,
    });
    const refresh = await issueRefreshToken(
      this.db,
      IDENTITY_KIND.ARTIST,
      account.artist_id,
    );

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: account.artist_id,
      action: AUDIT_ACTION.ARTIST_LOGIN,
      targetKind: AUDIT_TARGET_KIND.ARTIST_ACCOUNT,
      targetId: account.artist_id,
    });

    return {
      token: signed.token,
      refreshToken: refresh.rawToken,
      expiresInSeconds: signed.expiresInSeconds,
      refreshExpiresInSeconds: refresh.expiresInSeconds,
      artist: {
        id: account.artist_id,
        email: account.email,
        slug: account.slug,
        stageName: account.stage_name,
      },
    };
  }

  async refresh(rawToken: string): Promise<ArtistRefreshResult> {
    const validated = await consumeRefreshToken(this.db, rawToken);
    if (!validated || validated.kind !== IDENTITY_KIND.ARTIST) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    const rows = await getArtistAccountById.run(
      { artistId: validated.subjectId },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError("Account not found");
    }
    const account = rows[0];
    if (!account.is_active) {
      throw new ForbiddenError("Account disabled");
    }

    const signed = signIdentityToken({
      data: account.email,
      kind: UserKind.ARTIST,
      sub: account.artist_id,
    });
    const refresh = await issueRefreshToken(
      this.db,
      IDENTITY_KIND.ARTIST,
      account.artist_id,
    );

    return {
      token: signed.token,
      refreshToken: refresh.rawToken,
      expiresInSeconds: signed.expiresInSeconds,
      refreshExpiresInSeconds: refresh.expiresInSeconds,
      artist: {
        id: account.artist_id,
        email: account.email,
        slug: account.slug,
        stageName: account.stage_name,
      },
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await revokeRefreshToken(this.db, rawRefreshToken);
  }

  async forgotPassword(email: string, locale: EmailLocale): Promise<void> {
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    const rows = await setArtistPasswordResetToken.run(
      {
        email: email.toLowerCase(),
        tokenHash,
        expiresAt,
      },
      this.db,
    );
    if (rows.length === 0) {
      // Do NOT reveal whether the email exists.
      return;
    }

    const baseUrl = config.app.baseUrl ?? "";
    const resetUrl = `${baseUrl}/${locale}/artist/reset-password?token=${rawToken}`;

    await getEmailQueue().enqueue({
      template: EmailTemplate.PASSWORD_RESET,
      recipient: email,
      locale,
      payload: { resetUrl, expiresAt: expiresAt.toISOString() },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const newHash = await hashPassword(newPassword);
    const rows = await consumeArtistPasswordResetToken.run(
      { tokenHash, newPasswordHash: newHash },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_RESET_TOKEN);
    }
  }
}

export default ArtistAuthService;
