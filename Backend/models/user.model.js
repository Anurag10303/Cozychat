import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
    },
    /**
     * ECDH public key stored as a JSON Web Key (JWK) string.
     * Used for end-to-end encryption key exchange.
     * Set by the client on first login; updated if the client regenerates keys.
     * The server stores this opaquely — it never participates in decryption.
     */
    publicKey: {
      type: String,
      default: null,
    },
    /**
     * The user's ECDH private key, wrapped (encrypted) with a key derived
     * from their password via PBKDF2. This allows the private key to be
     * restored after logout or browser data loss without ever exposing it
     * to the server in plaintext.
     *
     * Format: base64(<12-byte IV> + <AES-GCM ciphertext of PKCS8 private key>)
     *
     * The server cannot decrypt this — the wrapping key is derived from the
     * user's password which never leaves the client.
     */
    encryptedPrivateKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
