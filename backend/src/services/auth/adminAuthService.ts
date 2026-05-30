import { getAdminByEmail } from "@src/db/query/adminUser/getAdminByEmail.types";
import { getAdminById } from "@src/db/query/adminUser/getAdminById.types";
import { incrementAdminFailedAttempts } from "@src/db/query/adminUser/incrementAdminFailedAttempts.types";
import { resetAdminFailedAttempts } from "@src/db/query/adminUser/resetAdminFailedAttempts.types";
import { recordAudit } from "@src/helpers/audit";
import { signIdentityToken, UserKind } from "@src/helpers/auth/identity";
import { verifyPassword } from "@src/helpers/auth/password";
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
import { Pool } from "pg";

export interface AdminLoginResult {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  admin: { id: string; email: string; fullName: string };
}

export interface AdminRefreshResult {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  admin: { id: string; email: string; fullName: string };
}

export class AdminAuthService {
  constructor(private db: Pool) {}

  async login(email: string, password: string): Promise<AdminLoginResult> {
    const rows = await getAdminByEmail.run(
      { email: email.toLowerCase() },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const admin = rows[0];
    if (!admin.is_active) {
      throw new ForbiddenError("Account disabled");
    }
    if (admin.locked_until && admin.locked_until.getTime() > Date.now()) {
      throw new ForbiddenError("Account temporarily locked");
    }

    const ok = await verifyPassword(admin.password_hash, password);
    if (!ok) {
      await incrementAdminFailedAttempts.run({ adminId: admin.id }, this.db);
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    await resetAdminFailedAttempts.run({ adminId: admin.id }, this.db);

    const signed = signIdentityToken({
      data: admin.email,
      kind: UserKind.ADMIN,
      sub: admin.id,
    });
    const refresh = await issueRefreshToken(
      this.db,
      IDENTITY_KIND.ADMIN,
      admin.id,
    );

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ADMIN,
      actorId: admin.id,
      action: AUDIT_ACTION.ADMIN_LOGIN,
      targetKind: AUDIT_TARGET_KIND.ADMIN_USER,
      targetId: admin.id,
    });

    return {
      token: signed.token,
      refreshToken: refresh.rawToken,
      expiresInSeconds: signed.expiresInSeconds,
      refreshExpiresInSeconds: refresh.expiresInSeconds,
      admin: { id: admin.id, email: admin.email, fullName: admin.full_name },
    };
  }

  async refresh(rawToken: string): Promise<AdminRefreshResult> {
    const validated = await consumeRefreshToken(this.db, rawToken);
    if (!validated || validated.kind !== IDENTITY_KIND.ADMIN) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    const rows = await getAdminById.run(
      { adminId: validated.subjectId },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError("Account not found");
    }
    const admin = rows[0];
    if (!admin.is_active) {
      throw new ForbiddenError("Account disabled");
    }

    const signed = signIdentityToken({
      data: admin.email,
      kind: UserKind.ADMIN,
      sub: admin.id,
    });
    const refresh = await issueRefreshToken(
      this.db,
      IDENTITY_KIND.ADMIN,
      admin.id,
    );

    return {
      token: signed.token,
      refreshToken: refresh.rawToken,
      expiresInSeconds: signed.expiresInSeconds,
      refreshExpiresInSeconds: refresh.expiresInSeconds,
      admin: { id: admin.id, email: admin.email, fullName: admin.full_name },
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await revokeRefreshToken(this.db, rawRefreshToken);
  }
}

export default AdminAuthService;
