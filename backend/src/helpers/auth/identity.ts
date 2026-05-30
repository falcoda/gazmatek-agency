import { config } from "@src/helpers/config";
import jwt, { SignOptions } from "jsonwebtoken";

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

export function signIdentityToken(
  payload: IdentityTokenPayload,
  hours: number = DEFAULT_EXPIRY_HOURS,
): SignedIdentityToken {
  const expiresInSeconds = hours * SECONDS_PER_HOUR;
  const options: SignOptions = { expiresIn: expiresInSeconds };
  const token = jwt.sign(payload, config.jwt.key, options);
  return { token, expiresInSeconds };
}

export function verifyIdentityToken(token: string): IdentityTokenPayload {
  const decoded = jwt.verify(token, config.jwt.key);
  if (
    typeof decoded === "string" ||
    !("kind" in decoded) ||
    !("sub" in decoded)
  ) {
    throw new Error("Invalid identity token shape");
  }
  return decoded as IdentityTokenPayload;
}
