import {
  decryptNullable,
  decryptValue,
  encryptOptionalText,
  encryptValue,
  hashToken,
  isEncrypted,
} from "@src/helpers/crypto";

describe("hashToken", () => {
  it("returns a 64-character hex string", () => {
    const hash = hashToken("my-secret-token");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same input produces same hash", () => {
    const token = "stable-token-abc";
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
  });

  it("handles empty string", () => {
    const hash = hashToken("");
    expect(hash).toHaveLength(64);
  });
});

describe("isEncrypted", () => {
  it("returns true for a value produced by encryptValue", () => {
    const encrypted = encryptValue("some data");
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isEncrypted("hello world")).toBe(false);
    expect(isEncrypted("enc:v0:not-real-prefix")).toBe(false);
  });
});

describe("encryptValue / decryptValue round-trip", () => {
  it("decrypts back to the original plaintext", () => {
    const plaintext = "super-secret-national-number";
    const ciphertext = encryptValue(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(decryptValue(ciphertext)).toBe(plaintext);
  });

  it("produces different ciphertexts for the same input (random IV)", () => {
    const plaintext = "same-plaintext";
    const ct1 = encryptValue(plaintext);
    const ct2 = encryptValue(plaintext);
    // Different IV every call → different base64 output
    expect(ct1).not.toBe(ct2);
    // But both decrypt to the same value
    expect(decryptValue(ct1)).toBe(plaintext);
    expect(decryptValue(ct2)).toBe(plaintext);
  });

  it("encrypts and decrypts unicode / multi-byte characters", () => {
    const plaintext = "ñoño – café 日本語";
    expect(decryptValue(encryptValue(plaintext))).toBe(plaintext);
  });

  it("encrypts and decrypts an empty string", () => {
    expect(decryptValue(encryptValue(""))).toBe("");
  });

  it("throws when the ciphertext is tampered", () => {
    const ciphertext = encryptValue("important data");
    // Corrupt a byte in the base64 payload
    const prefix = "enc:v1:";
    const payload = ciphertext.slice(prefix.length);
    const tamperedPayload = payload.slice(0, 10) + "X" + payload.slice(11);
    const tampered = prefix + tamperedPayload;

    expect(() => decryptValue(tampered)).toThrow();
  });

  it("passes legacy plaintext through unchanged (no prefix)", () => {
    const legacy = "old-plaintext-from-before-encryption";
    expect(decryptValue(legacy)).toBe(legacy);
  });
});

describe("encryptOptionalText", () => {
  it("returns empty string for null input", () => {
    expect(encryptOptionalText(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(encryptOptionalText(undefined)).toBe("");
  });

  it("returns empty string for blank/whitespace-only input", () => {
    expect(encryptOptionalText("   ")).toBe("");
    expect(encryptOptionalText("")).toBe("");
  });

  it("encrypts non-empty values and trims whitespace before encrypting", () => {
    const result = encryptOptionalText("  BE12 3456 7890  ");
    expect(isEncrypted(result)).toBe(true);
    expect(decryptValue(result)).toBe("BE12 3456 7890");
  });
});

describe("decryptNullable", () => {
  it("returns null for null input", () => {
    expect(decryptNullable(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(decryptNullable(undefined)).toBeNull();
  });

  it("decrypts an encrypted value", () => {
    const plaintext = "sensitive-data";
    const ciphertext = encryptValue(plaintext);
    expect(decryptNullable(ciphertext)).toBe(plaintext);
  });

  it("passes legacy plaintext through unchanged", () => {
    expect(decryptNullable("old-plain")).toBe("old-plain");
  });
});
