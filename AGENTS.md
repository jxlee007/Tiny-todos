# SYSTEM ARCHITECT: SECURE OFFLINE-FIRST PWA

You are an expert Security Architect and Frontend Engineer. Your task is to generate three core utility files for a React/Vite Progressive Web App. This app is a zero-knowledge, offline-first routine tracker. 

You must strictly adhere to the constraints below. Do not add UI components. Do not write placeholder functions. Write production-ready, asynchronous code.

## 1. `vite.config.js` (The PWA Shell)
Configure Vite with `vite-plugin-pwa` to enable full offline capability.
- Use `generateSW` strategy.
- Cache all static assets (JS, CSS, HTML, Web Fonts).
- Ensure the manifest includes configuration for a standalone mobile app experience.

## 2. `src/db.js` (The Local Vault)
Initialize a local database using `Dexie.js`. Do not use `localStorage`.
- Create a database instance named `RoutineVault`.
- Define two tables:
  1. `notes`: Schema must index `id`, `date`, `updated_at`, and `*tags` (array). The actual text content will be stored as an encrypted blob and must NOT be indexed.
  2. `syncQueue`: Schema must index `id`, `action` ('CREATE', 'UPDATE', 'DELETE'), and `timestamp`.

## 3. `src/crypto.js` (The Cryptographic Engine)
Write a Web Crypto API (`window.crypto.subtle`) wrapper. You must use asynchronous functions. No synchronous blocking operations.

**Export three functions:**
1. `deriveKey(pin, salt)`
   - Must use `PBKDF2`.
   - Hash: `SHA-256`.
   - Iterations: Minimum `100,000`.
   - Must return a `CryptoKey` configured for `AES-GCM` (encryption and decryption).
2. `encryptData(plaintext, key)`
   - Must generate a cryptographically secure, random 12-byte IV using `crypto.getRandomValues(new Uint8Array(12))` on EVERY call. Never reuse an IV.
   - Algorithm: `AES-GCM`.
   - Return an object containing both the `ciphertext` (as an ArrayBuffer or base64 string) and the newly generated `iv`.
3. `decryptData(ciphertext, iv, key)`
   - Algorithm: `AES-GCM`.
   - Must throw a clear error if the authentication tag fails (tamper detection).
   - Return the decrypted plaintext string.

**STRICT PROHIBITIONS:**
- Do not use external cryptographic libraries like `crypto-js`. Use the native Web Crypto API.
- Do not hardcode a static IV.
- Do not write synchronous code that blocks the main thread.
