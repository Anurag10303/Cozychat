/**
 * End-to-End Encryption Utilities
 *
 * Flow:
 *  1. On first login → generate ECDH key pair, store private key in IndexedDB,
 *     upload public key (JWK) to server.
 *  2. When opening a conversation → fetch the other user's public key,
 *     derive a shared AES-GCM key via ECDH.
 *  3. Encrypt every outgoing message with AES-GCM (random IV per message).
 *  4. Decrypt every incoming message with the same derived shared key.
 *
 * The server only ever sees base64-encoded ciphertext + IV — never plaintext.
 *
 * Key persistence (Option 2 — encrypted server backup):
 *  - On first login the private key is wrapped with a PBKDF2-derived AES-GCM
 *    key (derived from the user's password + userId as salt) and the encrypted
 *    blob is uploaded to the server.
 *  - On subsequent logins the blob is fetched and unwrapped locally using the
 *    password the user just typed. The raw private key never leaves the device
 *    and the server cannot decrypt the blob.
 *  - If IndexedDB already holds a valid private key (same session / tab) the
 *    network round-trip is skipped entirely.
 */

const DB_NAME = "cozy_e2ee";
const DB_STORE = "keys";
const DB_VERSION = 1;
const PRIVATE_KEY_RECORD = "myPrivateKey";
const PUBLIC_KEY_RECORD = "myPublicKey";

// ── IndexedDB helpers ──────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const req = tx.objectStore(DB_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Key generation ─────────────────────────────────────────────

/**
 * Generate an ECDH key pair (P-256).
 * Both keys are marked extractable:true so we can export the public key as JWK
 * and wrap the private key for backup. The private key is only ever exported
 * in PKCS8 format inside wrapPrivateKey() where it is immediately re-encrypted.
 */
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // extractable — needed for PKCS8 export in wrapPrivateKey
    ["deriveKey"],
  );
  return keyPair;
}

/**
 * Persist the local key pair to IndexedDB.
 * We store the CryptoKey objects directly — IndexedDB supports this natively
 * and it is safer than exporting the private key as bytes to JS memory.
 */
export async function storeKeyPair(keyPair) {
  await idbSet(PRIVATE_KEY_RECORD, keyPair.privateKey);
  await idbSet(PUBLIC_KEY_RECORD, keyPair.publicKey);
}

/**
 * Load the private key from IndexedDB.
 * Returns null if it hasn't been generated yet.
 */
export async function loadPrivateKey() {
  return idbGet(PRIVATE_KEY_RECORD);
}

/**
 * Load the public key CryptoKey from IndexedDB.
 */
export async function loadPublicKey() {
  return idbGet(PUBLIC_KEY_RECORD);
}

/**
 * Export a CryptoKey (public) as a JWK string safe for transmission.
 */
export async function exportPublicKeyJWK(publicKey) {
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  return JSON.stringify(jwk);
}

/**
 * Import a JWK string back into a CryptoKey (for another user's public key).
 */
export async function importPublicKeyJWK(jwkString) {
  const jwk = typeof jwkString === "string" ? JSON.parse(jwkString) : jwkString;
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [], // public key used only for ECDH derivation — no direct usage
  );
}

// ── Shared secret derivation ───────────────────────────────────

/**
 * Derive a symmetric AES-GCM key from our private key + the other user's public key.
 * This is deterministic: both sides arrive at the same key independently.
 * The derived key is non-extractable.
 */
export async function deriveSharedKey(myPrivateKey, theirPublicKey) {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"],
  );
}

// ── Encrypt / Decrypt ──────────────────────────────────────────

/**
 * Encrypt a plaintext string with the shared AES-GCM key.
 * Returns an object { iv, ciphertext } both base64-encoded.
 * A random 96-bit IV is generated per message.
 */
export async function encryptMessage(sharedKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    encoded,
  );

  return {
    iv: bufToBase64(iv),
    ciphertext: bufToBase64(new Uint8Array(ciphertextBuffer)),
  };
}

/**
 * Decrypt a { iv, ciphertext } payload produced by encryptMessage.
 * Returns the original plaintext string, or null if decryption fails.
 */
export async function decryptMessage(sharedKey, iv, ciphertext) {
  try {
    const ivBuf = base64ToBuf(iv);
    const ciphertextBuf = base64ToBuf(ciphertext);

    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      sharedKey,
      ciphertextBuf,
    );

    return new TextDecoder().decode(plaintextBuffer);
  } catch {
    // Decryption failure — key mismatch or corrupted data
    return null;
  }
}

// ── Serialisation helpers ──────────────────────────────────────

/**
 * Encode a binary encrypted message as a single string for the wire.
 * Format: ENC:base64(iv):base64(ciphertext)
 * This is what gets stored in MongoDB and sent via socket.
 */
export function packEncrypted({ iv, ciphertext }) {
  return `ENC:${iv}:${ciphertext}`;
}

/**
 * Parse a packed encrypted string back into { iv, ciphertext }.
 * Returns null if the string is not in the expected format
 * (e.g. legacy plaintext messages).
 */
export function unpackEncrypted(packed) {
  if (!packed || !packed.startsWith("ENC:")) return null;
  const parts = packed.slice(4).split(":");
  if (parts.length !== 2) return null;
  const [iv, ciphertext] = parts;
  return { iv, ciphertext };
}

/**
 * Returns true if a message string is E2EE-encrypted by this client.
 */
export function isEncrypted(text) {
  return typeof text === "string" && text.startsWith("ENC:");
}

// ── Utility ────────────────────────────────────────────────────

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...buf));
}

function base64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

// ── High-level session helpers ─────────────────────────────────

/** In-memory cache: userId → CryptoKey (derived shared key) */
const sharedKeyCache = new Map();

/**
 * Get or derive the shared AES-GCM key for a conversation partner.
 * Caches the result so ECDH is only done once per session.
 *
 * @param {string} partnerId - The other user's MongoDB _id
 * @param {string} partnerPublicKeyJWK - Their public key from the server
 */
export async function getSharedKey(partnerId, partnerPublicKeyJWK) {
  if (sharedKeyCache.has(partnerId)) {
    return sharedKeyCache.get(partnerId);
  }

  const myPrivateKey = await loadPrivateKey();
  if (!myPrivateKey) {
    throw new Error(
      "Local private key not found. Re-login to regenerate keys.",
    );
  }

  const theirPublicKey = await importPublicKeyJWK(partnerPublicKeyJWK);
  const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKey);
  sharedKeyCache.set(partnerId, sharedKey);
  return sharedKey;
}

/** Clear the shared key cache (call on logout). */
export function clearKeyCache() {
  sharedKeyCache.clear();
}

// ── Private key wrapping (for server backup) ───────────────────

/**
 * Derive an AES-GCM-256 wrapping key from the user's password and userId.
 *
 * We use PBKDF2 with:
 *   - salt  = UTF-8 bytes of userId  (unique per user, no need for random salt
 *             because the userId is already unique and we are not trying to
 *             protect against offline dictionary attacks across users — the
 *             wrapped blob is per-user and the attacker must know which user
 *             they are targeting)
 *   - iterations = 300,000  (OWASP 2023 recommendation for PBKDF2-SHA-256)
 *   - hash  = SHA-256
 *   - output = 256-bit AES-GCM key (non-extractable)
 *
 * This key is derived fresh from the password each time it is needed and
 * is never stored anywhere.
 *
 * @param {string} password - The user's plaintext password (used once, then discarded)
 * @param {string} userId   - The user's MongoDB _id (used as PBKDF2 salt)
 * @returns {Promise<CryptoKey>} AES-GCM wrapping key
 */
export async function deriveWrappingKey(password, userId) {
  const enc = new TextEncoder();

  // Import the password as raw key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  // Derive an AES-GCM key using the userId as the salt
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(userId),
      iterations: 300_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable — the wrapping key itself never leaves the browser
    ["wrapKey", "unwrapKey"],
  );
}

/**
 * Wrap (encrypt) the ECDH private key with the wrapping key so it can be
 * safely stored on the server.
 *
 * The output format is:
 *   base64( <12-byte random IV> || <AES-GCM ciphertext of PKCS8 private key> )
 *
 * The IV is prepended to the ciphertext so it is available during unwrapping.
 *
 * @param {CryptoKey} privateKey   - The ECDH private key to protect
 * @param {CryptoKey} wrappingKey  - The AES-GCM key derived from the password
 * @returns {Promise<string>} base64-encoded blob safe to send to the server
 */
export async function wrapPrivateKey(privateKey, wrappingKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const wrappedBuffer = await crypto.subtle.wrapKey(
    "pkcs8", // export format for private keys
    privateKey,
    wrappingKey,
    { name: "AES-GCM", iv },
  );

  // Prepend IV to the ciphertext so we can recover it on unwrap
  const combined = new Uint8Array(iv.byteLength + wrappedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(wrappedBuffer), iv.byteLength);

  return bufToBase64(combined);
}

/**
 * Unwrap (decrypt) an ECDH private key from the blob produced by wrapPrivateKey.
 *
 * The result is an extractable CryptoKey so it can be stored back into
 * IndexedDB as a native CryptoKey object (IndexedDB handles the serialisation).
 *
 * @param {string}    blob         - base64 string from the server
 * @param {CryptoKey} wrappingKey  - AES-GCM key derived from the user's password
 * @returns {Promise<CryptoKey>} Restored ECDH private key
 */
export async function unwrapPrivateKey(blob, wrappingKey) {
  const combined = base64ToBuf(blob);

  // First 12 bytes are the IV, the rest is the wrapped key
  const iv = combined.slice(0, 12);
  const wrappedBuffer = combined.slice(12);

  return crypto.subtle.unwrapKey(
    "pkcs8", // format we used when wrapping
    wrappedBuffer,
    wrappingKey,
    { name: "AES-GCM", iv }, // unwrap algorithm params
    { name: "ECDH", namedCurve: "P-256" }, // algorithm of the unwrapped key
    true, // extractable — needed to re-derive public key
    ["deriveKey"], // usages of the unwrapped key
  );
}

/**
 * Given a restored private key, re-derive the corresponding public key as a
 * CryptoKey by round-tripping through JWK export/import.
 *
 * Background: Web Crypto has no direct "privateKey → publicKey" API.
 * However an ECDH private key JWK contains the public point (x, y) alongside
 * the private scalar (d). We export the private key as JWK, strip the "d"
 * field, and import the remainder as a public key.
 *
 * @param {CryptoKey} privateKey
 * @returns {Promise<CryptoKey>} The matching public key
 */
async function derivePublicKeyFromPrivate(privateKey) {
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);

  // Remove the private scalar — what remains is the public point
  const { d: _d, ...publicJwk } = jwk;
  publicJwk.key_ops = []; // public key has no direct usages

  return crypto.subtle.importKey(
    "jwk",
    publicJwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );
}

// ── Top-level bootstrap ────────────────────────────────────────

/**
 * Ensure the user has a valid ECDH key pair available in IndexedDB,
 * using a server-side encrypted backup to survive logout / browser data loss.
 *
 * This is the single entry point called by E2EEContext on every login.
 *
 * Algorithm:
 *  1. IndexedDB already has a private key → nothing to do, return public JWK.
 *  2. Server has an encrypted backup blob → derive wrapping key from password,
 *     unwrap the private key, re-derive the public key, store both in IndexedDB,
 *     return public JWK.
 *  3. Neither exists (brand new user or backup lost) → generate a fresh key pair,
 *     wrap the private key, upload the backup, store in IndexedDB, return public JWK.
 *
 * In all cases the function resolves to the JWK string of the user's public key,
 * which the caller should then POST to /user/public-key.
 *
 * @param {string} password - Plaintext password typed by the user at login
 * @param {string} userId   - MongoDB _id of the logged-in user
 * @param {string} token    - JWT bearer token for authenticated API calls
 * @param {string} baseUrl  - API base URL (e.g. "http://localhost:3000")
 * @returns {Promise<string>} JWK string of the user's public key
 */
export async function ensureKeyPairWithBackup(
  password,
  userId,
  token,
  baseUrl,
) {
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // ── Step 1: check IndexedDB first (fastest path — no network needed) ──
  const existingPrivKey = await loadPrivateKey();
  if (existingPrivKey) {
    const pub = await loadPublicKey();
    return exportPublicKeyJWK(pub);
  }

  // ── Step 2: attempt to restore from server backup ─────────────────────
  try {
    const backupRes = await fetch(`${baseUrl}/user/key-backup`, {
      credentials: "include",
      headers: authHeaders,
    });

    if (backupRes.ok) {
      const backupData = await backupRes.json();

      if (backupData.encryptedPrivateKey) {
        // Derive the wrapping key from the password the user just typed
        const wrappingKey = await deriveWrappingKey(password, userId);

        // Unwrap the private key from the encrypted blob
        const privateKey = await unwrapPrivateKey(
          backupData.encryptedPrivateKey,
          wrappingKey,
        );

        // Re-derive the public key from the private key
        const publicKey = await derivePublicKeyFromPrivate(privateKey);

        // Persist both keys to IndexedDB for this session
        await idbSet(PRIVATE_KEY_RECORD, privateKey);
        await idbSet(PUBLIC_KEY_RECORD, publicKey);

        return exportPublicKeyJWK(publicKey);
      }
    }
  } catch (err) {
    // Network error or decryption failure — fall through to key generation
    // Decryption failure most likely means the user changed their password.
    // In that case we generate a new keypair below and overwrite the backup.
    console.warn("[E2EE] Key backup restore failed, generating new pair:", err);
  }

  // ── Step 3: generate a fresh key pair and back it up ──────────────────
  const keyPair = await generateKeyPair();
  await storeKeyPair(keyPair);

  // Wrap the private key and upload the backup
  try {
    const wrappingKey = await deriveWrappingKey(password, userId);
    const encryptedPrivateKey = await wrapPrivateKey(
      keyPair.privateKey,
      wrappingKey,
    );

    await fetch(`${baseUrl}/user/key-backup`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders,
      body: JSON.stringify({ encryptedPrivateKey }),
    });
  } catch (err) {
    // Backup upload failed — keys are still in IndexedDB for this session.
    // The user will generate a new pair on next logout+login, but that is
    // better than blocking the login flow entirely.
    console.warn("[E2EE] Key backup upload failed:", err);
  }

  return exportPublicKeyJWK(keyPair.publicKey);
}

/**
 * Legacy helper kept for any code that calls it outside the backup flow.
 * Prefer ensureKeyPairWithBackup() on login.
 *
 * Ensure the user has a key pair. If not, generate one, persist it,
 * and return the public key JWK ready to upload to the server.
 */
export async function ensureKeyPair() {
  const existing = await loadPrivateKey();
  if (existing) {
    const pub = await loadPublicKey();
    const jwk = await exportPublicKeyJWK(pub);
    return jwk;
  }

  const keyPair = await generateKeyPair();
  await storeKeyPair(keyPair);
  const jwk = await exportPublicKeyJWK(keyPair.publicKey);
  return jwk;
}
