/**
 * E2EEContext
 *
 * Provides:
 *  - bootstrapE2EE(password) — called explicitly from SignIn/SignUp after login;
 *                              restores or generates keys and uploads the public key.
 *                              Must be called with the plaintext password the user
 *                              just typed — it is used once to derive the wrapping
 *                              key and is never stored.
 *  - getConversationKey(userId) — derives+caches the shared AES key for a partner
 *  - encryptText(userId, text)  — encrypt before sending
 *  - decryptText(userId, packed)— decrypt on receive
 *  - isReady                    — true once keys are loaded for this session
 */

import { createContext, useContext, useRef, useState } from "react";
import {
  ensureKeyPairWithBackup,
  getSharedKey,
  encryptMessage,
  decryptMessage,
  packEncrypted,
  unpackEncrypted,
  isEncrypted,
  clearKeyCache,
} from "../utils/crypto";
import { useAuth } from "./AuthProvider";
import BASE_URL from "../config";

const E2EEContext = createContext(null);

export function E2EEProvider({ children }) {
  const [authUser] = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch + cache the other user's public key from the server ──
  const partnerKeyCache = useRef(new Map()); // userId → JWK string

  async function fetchPartnerKey(userId) {
    if (partnerKeyCache.current.has(userId)) {
      return partnerKeyCache.current.get(userId);
    }
    const res = await fetch(`${BASE_URL}/user/public-key/${userId}`, {
      credentials: "include",
      headers: authUser?.token
        ? { Authorization: `Bearer ${authUser.token}` }
        : {},
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.publicKey) return null;
    partnerKeyCache.current.set(userId, data.publicKey);
    return data.publicKey;
  }

  // ── Derive (or reuse cached) shared key for a conversation ─────
  async function getConversationKey(userId) {
    try {
      const jwk = await fetchPartnerKey(userId);
      if (!jwk) return null;
      return await getSharedKey(userId, jwk);
    } catch (err) {
      console.error("[E2EE] getConversationKey failed:", err);
      return null;
    }
  }

  // ── Public API ─────────────────────────────────────────────────

  /**
   * Bootstrap E2EE keys for the freshly logged-in user.
   *
   * Call this from your SignIn / SignUp handler BEFORE clearing formData,
   * while you still have the plaintext password in hand.
   *
   * What this does:
   *  1. Checks IndexedDB — if keys are already there, skips everything.
   *  2. Checks the server for an encrypted key backup — if found, unwraps it
   *     using a key derived from the password and restores keys to IndexedDB.
   *  3. If no backup exists, generates a fresh key pair, wraps the private key
   *     with a password-derived key, uploads the backup, and stores keys locally.
   *  4. In all cases, uploads the public key to the server (idempotent upsert).
   *
   * The password is used only to derive the wrapping key and is never stored.
   *
   * @param {string} password - Plaintext password the user typed at login
   */
  async function bootstrapE2EE(password) {
    // authUser may not be in context state yet if called synchronously right
    // after setAuthUser — read from localStorage as the reliable source.
    let token, userId;
    try {
      const raw = localStorage.getItem("RealChat");
      const stored = raw ? JSON.parse(raw) : null;
      token = stored?.token;
      userId = stored?.user?._id;
    } catch {
      token = authUser?.token;
      userId = authUser?.user?._id;
    }

    if (!token || !userId) {
      console.warn("[E2EE] bootstrapE2EE called before authUser was stored");
      return;
    }

    try {
      setIsReady(false);

      // ensureKeyPairWithBackup handles all three cases (IndexedDB hit,
      // server restore, fresh generation) and returns the public key JWK.
      const publicKeyJWK = await ensureKeyPairWithBackup(
        password,
        userId,
        token,
        BASE_URL,
      );

      // Upload public key to server — idempotent, safe to call every login
      await fetch(`${BASE_URL}/user/public-key`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicKey: publicKeyJWK }),
      });

      // Clear the partner key cache so stale entries from a previous session
      // don't survive into this one
      partnerKeyCache.current.clear();
      clearKeyCache();

      setIsReady(true);
    } catch (err) {
      console.error("[E2EE] Key bootstrap failed:", err);
      setError(err.message);
      // Still mark ready so the app doesn't hang — it will fall back to plaintext
      setIsReady(true);
    }
  }

  /**
   * Encrypt a message text for a given conversation partner.
   * Falls back to plaintext if E2EE is unavailable (no partner key etc.).
   * Returns the string to store/send.
   */
  async function encryptText(partnerId, plaintext) {
    if (!plaintext) return plaintext;
    try {
      const sharedKey = await getConversationKey(partnerId);
      if (!sharedKey) return plaintext; // graceful fallback
      const { iv, ciphertext } = await encryptMessage(sharedKey, plaintext);
      return packEncrypted({ iv, ciphertext });
    } catch (err) {
      console.error("[E2EE] Encryption failed, sending plaintext:", err);
      return plaintext;
    }
  }

  /**
   * Decrypt a packed ciphertext from a given conversation partner.
   * Returns the plaintext, or the original string if not encrypted / decryption fails.
   */
  async function decryptText(partnerId, packed) {
    if (!packed || !isEncrypted(packed)) return packed; // plaintext pass-through
    try {
      const sharedKey = await getConversationKey(partnerId);
      if (!sharedKey) return "[Encrypted — key unavailable]";
      const unpacked = unpackEncrypted(packed);
      if (!unpacked) return packed;
      const result = await decryptMessage(
        sharedKey,
        unpacked.iv,
        unpacked.ciphertext,
      );
      return result ?? "[Decryption failed]";
    } catch (err) {
      console.error("[E2EE] Decryption failed:", err);
      return "[Decryption failed]";
    }
  }

  return (
    <E2EEContext.Provider
      value={{
        isReady,
        error,
        bootstrapE2EE,
        encryptText,
        decryptText,
        getConversationKey,
        isEncrypted: (text) => isEncrypted(text),
      }}
    >
      {children}
    </E2EEContext.Provider>
  );
}

export function useE2EE() {
  const ctx = useContext(E2EEContext);
  if (!ctx) throw new Error("useE2EE must be used inside <E2EEProvider>");
  return ctx;
}
