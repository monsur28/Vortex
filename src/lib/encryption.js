// Simple obfuscation to remain Edge compatible without requiring async Web Crypto API
// This prevents Next.js static generation errors with node:crypto

export function encryptUrl(text) {
  try {
    // Base64 encode and reverse the string to prevent casual scraping
    return btoa(text).split('').reverse().join('');
  } catch (error) {
    console.error('Encryption failed', error);
    return null;
  }
}

export function decryptUrl(text) {
  try {
    const reversed = text.split('').reverse().join('');
    return atob(reversed);
  } catch (error) {
    console.error('Decryption failed', error);
    return null;
  }
}
