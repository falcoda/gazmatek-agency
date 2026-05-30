import { createIdentityRefreshToken } from "@src/db/query/identityRefresh/createIdentityRefreshToken.types";
import { getIdentityRefreshToken } from "@src/db/query/identityRefresh/getIdentityRefreshToken.types";
import { revokeAllIdentityRefreshTokensForSubject } from "@src/db/query/identityRefresh/revokeAllForSubject.types";
import { revokeIdentityRefreshToken } from "@src/db/query/identityRefresh/revokeIdentityRefreshToken.types";
import { generateRawToken, hashToken } from "@src/helpers/auth/tokens";
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
  const rows = await getIdentityRefreshToken.run({ tokenHash }, db);
  if (rows.length === 0) return null;
  const row = rows[0];
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
