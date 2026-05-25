import { config } from "@src/helpers/config";
import crypto from "crypto";

/**
 * Application-level cryptography helpers.
 *
 * - `hashToken` produces a deterministic SHA-256 hash. Use it to compare bearer
 *   tokens (refresh / password reset) or to build a constant lookup hash for a
 *   value that is otherwise stored encrypted.
 * - `encryptValue` / `decryptValue` provide reversible AES-256-GCM encryption
 *   for sensitive data that must be read back in clear.
 *
 * Encrypted values are self-identifying: they always start with
 * `ENCRYPTION_PREFIX`, so `decryptValue` can transparently pass through legacy
 * plaintext during a gradual rollout / before a backfill script has run.
 *
 * Reversible encryption requires `DATA_ENCRYPTION_KEY` to be configured. When
 * it is absent the encrypt/decrypt helpers throw a clear error instead of
 * failing obscurely — `hashToken` works without a key.
 */

const ENCRYPTION_PREFIX = "enc:v1:";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/** Resolve the configured AES-256-GCM key, or fail loudly when it is missing. */
const requireEncryptionKey = (): Buffer => {
  if (!config.security.dataEncryptionKey) {
    throw new Error(
      "DATA_ENCRYPTION_KEY is not configured: set it to use reversible encryption.",
    );
  }

  return config.security.dataEncryptionKey;
};

/** Deterministic SHA-256 hash (hex) of a token. */
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token, "utf8").digest("hex");

/** Whether a stored value carries the application encryption envelope. */
export const isEncrypted = (value: string): boolean =>
  value.startsWith(ENCRYPTION_PREFIX);

/** Encrypt a plaintext value with AES-256-GCM. */
export const encryptValue = (plaintext: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    requireEncryptionKey(),
    iv,
  );
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);

  return `${ENCRYPTION_PREFIX}${payload.toString("base64")}`;
};

/** Decrypt a value produced by `encryptValue`, tolerating legacy plaintext. */
export const decryptValue = (value: string): string => {
  if (!isEncrypted(value)) {
    // Legacy plaintext written before encryption was enabled.
    return value;
  }

  const payload = Buffer.from(value.slice(ENCRYPTION_PREFIX.length), "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    requireEncryptionKey(),
    iv,
  );
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
};

/**
 * Encrypt an optional text value for a column whose query maps empty strings to
 * NULL (via `NULLIF`). Blank input is returned untouched so the `NULLIF` still
 * fires; non-blank input is encrypted.
 */
export const encryptOptionalText = (
  value: string | null | undefined,
): string => {
  const normalized = value?.trim() ?? "";

  return normalized === "" ? "" : encryptValue(normalized);
};

/** Decrypt a nullable column value, tolerating NULL and legacy plaintext. */
export const decryptNullable = (
  value: string | null | undefined,
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return decryptValue(value);
};
