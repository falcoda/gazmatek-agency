import { createIdentityRefreshToken } from "@src/db/query/identityRefresh/createIdentityRefreshToken.types";
import { getIdentityRefreshTokenAny } from "@src/db/query/identityRefresh/getIdentityRefreshTokenAny.types";
import { revokeAllIdentityRefreshTokensForSubject } from "@src/db/query/identityRefresh/revokeAllForSubject.types";
import { revokeIdentityRefreshToken } from "@src/db/query/identityRefresh/revokeIdentityRefreshToken.types";
import { generateRawToken, hashToken } from "@src/helpers/auth/tokens";
import logger from "@src/helpers/logger";
import type { Pool } from "pg";

const REFRESH_TOKEN_TTL_DAYS = 30;
const SECONDS_PER_DAY = 24 * 60 * 60;

export type IdentityKind = "admin" | "artist" | "client";

export interface IssuedRefreshToken {
  rawToken: string;
  expiresInSeconds: number;
}

export interface ValidatedRefreshToken {
  kind: IdentityKind;
  subjectId: string;
}

export async function issueRefreshToken(
  db: Pool,
  kind: IdentityKind,
  subjectId: string,
): Promise<IssuedRefreshToken> {
  const rawToken = generateRawToken();
  const expiresInSeconds = REFRESH_TOKEN_TTL_DAYS * SECONDS_PER_DAY;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  await createIdentityRefreshToken.run(
    {
      kind,
      subjectId,
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
    db,
  );
  return { rawToken, expiresInSeconds };
}

export async function consumeRefreshToken(
  db: Pool,
  rawToken: string,
): Promise<ValidatedRefreshToken | null> {
  const tokenHash = hashToken(rawToken);
  // #21 — look up regardless of revoked status so we can detect replay of an
  // already-consumed (rotated) token.
  const rows = await getIdentityRefreshTokenAny.run({ tokenHash }, db);
  if (rows.length === 0) return null;
  const row = rows[0];

  // The token exists but was already revoked: refresh tokens are single-use and
  // rotated on every consume, so a second presentation means the token was
  // stolen and replayed. Defeat the attacker by revoking every outstanding
  // session for the subject, and refuse this refresh.
  if (row.revoked_at) {
    logger.warn("Refresh token reuse detected — revoking all sessions", {
      kind: row.kind,
      subjectId: row.subject_id,
    });
    await revokeAllIdentityRefreshTokensForSubject.run(
      { kind: row.kind as IdentityKind, subjectId: row.subject_id },
      db,
    );
    return null;
  }

  // Normal rotation: consume (revoke) this token and return the validated subject.
  await revokeIdentityRefreshToken.run({ tokenHash }, db);
  return {
    kind: row.kind as IdentityKind,
    subjectId: row.subject_id,
  };
}

export async function revokeRefreshToken(
  db: Pool,
  rawToken: string,
): Promise<void> {
  await revokeIdentityRefreshToken.run({ tokenHash: hashToken(rawToken) }, db);
}

export async function revokeAllForSubject(
  db: Pool,
  kind: IdentityKind,
  subjectId: string,
): Promise<void> {
  await revokeAllIdentityRefreshTokensForSubject.run({ kind, subjectId }, db);
}
