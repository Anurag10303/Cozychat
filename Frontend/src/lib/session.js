// Session helpers shared by AuthProvider, sockets and API hooks.
export const STORAGE_KEY = "RealChat";

// Read the JWT's expiry (ms) without verifying it; the server still verifies.
export function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const isExpired = (token) => {
  const exp = getTokenExpiry(token);
  return exp !== null && exp <= Date.now();
};

/** The current session's JWT, for Authorization headers (null if signed out). */
export function getAuthToken() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))?.token ?? null;
  } catch {
    return null;
  }
}

/** Clear the stored session and send the user to sign in again. */
export function expireSession() {
  localStorage.removeItem(STORAGE_KEY);
  if (window.location.pathname !== "/login") {
    window.location.assign("/login?expired=1");
  }
}
