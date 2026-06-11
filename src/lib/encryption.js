import crypto from 'crypto';

// Use a stable key from environment variables or generate a deterministic one
// This keeps tokens secure but prevents them from invalidating across serverless function instances
const fallbackKey = crypto.scryptSync(process.env.PROXY_SECRET || 'default_stable_secret', 'salt', 32);
const ENCRYPTION_KEY = process.env.PROXY_ENCRYPTION_KEY 
  ? Buffer.from(process.env.PROXY_ENCRYPTION_KEY, 'hex') 
  : fallbackKey;
const IV_LENGTH = 16; // AES block size

export function encryptUrl(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Prepend IV to the encrypted string
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed', error);
    return null;
  }
}

export function decryptUrl(text) {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed', error);
    return null;
  }
}
