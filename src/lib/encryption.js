// Web Crypto API implementation for secure encryption
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKeyMaterial(password) {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
}

async function getKey(keyMaterial, salt) {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptUrl(text) {
  try {
    const password = process.env.ENCRYPTION_KEY || 'default-fallback-key';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    return JSON.stringify({
      ciphertext: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      salt: Array.from(salt)
    });
  } catch (error) {
    console.error('Encryption failed', error);
    return null;
  }
}

export async function decryptUrl(text) {
  try {
    const { ciphertext, iv, salt } = JSON.parse(text);
    const password = process.env.ENCRYPTION_KEY || 'default-fallback-key';
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, new Uint8Array(salt));
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(ciphertext)
    );
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed', error);
    return null;
  }
}
