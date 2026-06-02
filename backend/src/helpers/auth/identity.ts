import { config } from "@src/helpers/config";
import jwt, { Algorithm, SignOptions } from "jsonwebtoken";

export enum UserKind {
  ARTIST = "artist",
  ADMIN = "admin",
  CLIENT = "client",
}

export interface IdentityTokenPayload {
  data: string;
  kind: UserKind;
  sub: string;
}

export interface SignedIdentityToken {
  token: string;
  expiresInSeconds: number;
}

const DEFAULT_EXPIRY_HOURS = 12;
const SECONDS_PER_HOUR = 3600;

// Pin the signing algorithm so verification cannot be tricked into accepting a
// token signed with a different (or "none") algorithm. One symmetric key signs
// all three identity kinds, so this allowlist is the only barrier against an
// algorithm-confusion attack.
export const JWT_ALGORITHM: Algorithm = "HS256";
export const JWT_ALGORITHMS: Algorithm[] = [JWT_ALGORITHM];

const isUserKind = (value: unknown): value is UserKind =>
  typeof value === "string" &&
  (Object.values(UserKind) as string[]).includes(value);

export function signIdentityToken(
  payload: IdentityTokenPayload,
  hours: number = DEFAULT_EXPIRY_HOURS,
): SignedIdentityToken {
  const expiresInSeconds = hours * SECONDS_PER_HOUR;
  const options: SignOptions = {
    expiresIn: expiresInSeconds,
    algorithm: JWT_ALGORITHM,
  };
  const token = jwt.sign(payload, config.jwt.key, options);
  return { token, expiresInSeconds };
}

export function verifyIdentityToken(token: string): IdentityTokenPayload {
  const decoded = jwt.verify(token, config.jwt.key, {
    algorithms: JWT_ALGORITHMS,
  });
  if (
    typeof decoded === "string" ||
    !("kind" in decoded) ||
    !("sub" in decoded) ||
    !isUserKind(decoded.kind)
  ) {
    throw new Error("Invalid identity token shape");
  }
  return decoded as IdentityTokenPayload;
}
