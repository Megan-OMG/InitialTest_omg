const PBKDF2_ITERATIONS = 600000;
const subtle = window.crypto.subtle;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => Uint8Array.from(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));

const deriveAesKey = async (password, salt) => {
  const baseKey = await subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt a plaintext secret with a password.
 * @returns {Promise<{ salt: string, iv: string, ciphertext: string }>}
 */
export const encryptSecret = async (plaintext, password) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
  return { salt: toHex(salt), iv: toHex(iv), ciphertext: toHex(new Uint8Array(ciphertext)) };
};

/**
 * Decrypt a vault payload. Throws if the password is wrong (AES-GCM auth failure).
 * @returns {Promise<string>} the plaintext secret
 */
export const decryptSecret = async ({ salt, iv, ciphertext }, password) => {
  const key = await deriveAesKey(password, fromHex(salt));
  try {
    const plaintext = await subtle.decrypt({ name: 'AES-GCM', iv: fromHex(iv) }, key, fromHex(ciphertext));
    return decoder.decode(plaintext);
  } catch {
    throw new Error('Incorrect password');
  }
};
