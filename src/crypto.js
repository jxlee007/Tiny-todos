/**
 * Cryptographic Engine using native Web Crypto API.
 */

/**
 * Derives an AES-GCM CryptoKey using PBKDF2.
 * @param {string} pin - The user's PIN.
 * @param {Uint8Array} salt - The unique 16-byte salt.
 * @returns {Promise<CryptoKey>} - The derived AES-GCM key.
 */
export async function deriveKey(pin, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM and a dynamically generated IV.
 * @param {string} plaintext - The string to encrypt.
 * @param {CryptoKey} key - The AES-GCM key.
 * @returns {Promise<{ciphertext: string, iv: string}>} - The encrypted payload in base64.
 */
export async function encryptData(plaintext, key) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = enc.encode(plaintext);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedText
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Decrypts AES-GCM data.
 * @param {string} ciphertextBase64 - The encrypted payload in base64.
 * @param {string} ivBase64 - The IV used for encryption in base64.
 * @param {CryptoKey} key - The AES-GCM key.
 * @returns {Promise<string>} - The decrypted plaintext string.
 */
export async function decryptData(ciphertextBase64, ivBase64, key) {
  try {
    const ciphertext = base64ToBuffer(ciphertextBase64);
    const iv = base64ToBuffer(ivBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Authentication tag failed or invalid key/data.');
  }
}

// Utility: ArrayBuffer <-> Base64

export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  return window.btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
}

export function base64ToBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}
