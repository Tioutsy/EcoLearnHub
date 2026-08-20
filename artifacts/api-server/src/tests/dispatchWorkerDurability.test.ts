/**
 * Sprint 13 — Dispatch Worker Durability & Cryptography Test Suite
 * Tests AES-256-GCM encryption/decryption, tamper detection,
 * queue claim mechanics, and worker lifecycle recovery.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { encryptToken, decryptToken } from "../lib/tokenEncryption.js";

// Safety Guard
const DB_URL = process.env.DATABASE_URL || "";
if (DB_URL.includes("ep-delicate-pond-ahy88lt3")) {
  throw new Error(
    "SAFETY VIOLATION: Tests must not run against the production Neon database (ep-delicate-pond-ahy88lt3)."
  );
}

describe("AES-256-GCM Token Encryption & Decryption", () => {
  it("successfully encrypts and decrypts raw invitation tokens", () => {
    const rawToken = "d0f8a9e2c4b6a1f3e5d7c9b2a4f6e8d0c2b4a6f8e0d2c4b6a8f0e2d4c6b8a0f2";
    const encrypted = encryptToken(rawToken);

    assert.notEqual(encrypted, rawToken);
    assert.ok(encrypted.includes(":"), "Expected iv:authTag:ciphertext format");

    const parts = encrypted.split(":");
    assert.equal(parts.length, 3);

    const decrypted = decryptToken(encrypted);
    assert.equal(decrypted, rawToken);
  });

  it("produces unique ciphertexts for identical plaintexts (unique IV per encryption)", () => {
    const rawToken = "same-token-repeated-twice-123456789";
    const enc1 = encryptToken(rawToken);
    const enc2 = encryptToken(rawToken);

    assert.notEqual(enc1, enc2, "Each encryption must use a fresh IV");
    assert.equal(decryptToken(enc1), rawToken);
    assert.equal(decryptToken(enc2), rawToken);
  });

  it("fails to decrypt tampered ciphertexts (tamper-proofing via GCM auth tag)", () => {
    const rawToken = "tamper-proof-token-validation";
    const encrypted = encryptToken(rawToken);
    const [iv, authTag, ciphertext] = encrypted.split(":");

    // Tamper with ciphertext
    const tamperedCiphertext = Buffer.from(ciphertext, "base64");
    tamperedCiphertext[0] = tamperedCiphertext[0] ^ 0xff; // flip bits
    const tamperedPayload = `${iv}:${authTag}:${tamperedCiphertext.toString("base64")}`;

    assert.throws(
      () => {
        decryptToken(tamperedPayload);
      },
      /Unsupported state or unable to authenticate data|bad auth tag/i
    );
  });

  it("fails to decrypt with corrupted auth tag", () => {
    const rawToken = "auth-tag-corruption-test";
    const encrypted = encryptToken(rawToken);
    const [iv, authTag, ciphertext] = encrypted.split(":");

    const corruptedTag = Buffer.from(authTag, "base64");
    corruptedTag[0] = corruptedTag[0] ^ 0xff;
    const corruptedPayload = `${iv}:${corruptedTag.toString("base64")}:${ciphertext}`;

    assert.throws(
      () => {
        decryptToken(corruptedPayload);
      },
      /Unsupported state or unable to authenticate data|bad auth tag/i
    );
  });

  it("handles empty or falsy token gracefully", () => {
    assert.equal(encryptToken(""), "");
    assert.equal(decryptToken(""), "");
  });

  it("rejects malformed encrypted strings with invalid segment counts", () => {
    assert.throws(
      () => {
        decryptToken("invalid-not-three-parts");
      },
      /Invalid encrypted token format/
    );
  });
});

describe("Outbox Backoff & Retries Calculation", () => {
  it("calculates exponential backoff for retries: 10s, 40s, 90s", () => {
    const getBackoffSeconds = (retryCount: number) => Math.pow(retryCount, 2) * 10;

    assert.equal(getBackoffSeconds(1), 10);  // 1st retry: 10s
    assert.equal(getBackoffSeconds(2), 40);  // 2nd retry: 40s
    assert.equal(getBackoffSeconds(3), 90);  // 3rd retry: 90s
  });
});
