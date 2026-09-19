import { OAuth2Client } from "google-auth-library";
import AppError from "./AppError.js";

// One client per process: it caches Google's public signing certs between requests.
let client = null;
let clientFor = null;

// GOOGLE_CLIENT_ID is canonical; VITE_GOOGLE_CLIENT_ID is accepted too since
// it's the same public value and is easy to copy across from the frontend.
export const getGoogleClientId = () =>
  (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();

export const isGoogleAuthConfigured = () => Boolean(getGoogleClientId());

/**
 * Verify a Google Identity Services ID token (the `credential` from the
 * Sign in with Google button) and return the trusted identity.
 *
 * verifyIdToken checks the signature against Google's certs, expiry,
 * issuer, and that the token was minted for our client ID (audience).
 */
export async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId();
  if (!clientId) throw new AppError("Google sign-in is not configured", 503);

  if (clientFor !== clientId) {
    client = new OAuth2Client(clientId);
    clientFor = clientId;
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw new AppError("Invalid Google credential", 401);
  }

  if (!payload?.sub || !payload.email) {
    throw new AppError("Google account is missing required profile data", 401);
  }
  // Only trust the email for account matching when Google has verified it.
  if (!payload.email_verified) {
    throw new AppError("Your Google email address is not verified", 403);
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName: payload.name?.trim() || payload.email.split("@")[0],
    avatar: payload.picture || null,
  };
}
