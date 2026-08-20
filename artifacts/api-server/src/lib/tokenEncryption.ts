import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits standard for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

function getEncryptionKey(): Buffer {
  const secret =
    process.env.INVITATION_ENCRYPTION_KEY ||
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    "elevio-secure-invitation-token-encryption-key-v1";
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a raw invitation token with AES-256-GCM.
 * Output format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token.
 * Returns the original plaintext or throws if invalid or tampered.
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return "";
  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format: expected iv:authTag:ciphertext");
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length for AES-GCM");
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid AuthTag length for AES-GCM");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
