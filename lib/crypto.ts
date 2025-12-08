import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32-chars!!';
const ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes for AES-256
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

/**
 * Encrypts a password using AES-256-CBC
 * @param password The plaintext password to encrypt
 * @returns Object containing encrypted password and IV
 */
export function encryptPassword(password: string): { encryptedPassword: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedPassword: encrypted,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypts a password using AES-256-CBC
 * @param encryptedPassword The encrypted password
 * @param ivHex The initialization vector as hex string
 * @returns The decrypted plaintext password
 */
export function decryptPassword(encryptedPassword: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hashes a password using SHA-256 (for verification purposes)
 * @param password The password to hash
 * @returns The hashed password as hex string
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
