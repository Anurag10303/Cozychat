// Lazy loader for Google Identity Services (Sign in with Google).
// The script is only fetched on pages that render the button, and only once.
import BASE_URL from "../config";

const GIS_SRC = "https://accounts.google.com/gsi/client";

let clientIdPromise = null;
let loadPromise = null;
let initializedWith = null;
let credentialHandler = null;

/**
 * Resolve the Google OAuth client ID.
 * VITE_GOOGLE_CLIENT_ID (build time) wins; otherwise it's read from the
 * backend's GOOGLE_CLIENT_ID at runtime, so one server env var configures
 * localhost and every deployed URL without rebuilding the frontend.
 * Resolves to "" when Google sign-in isn't configured.
 */
export function getGoogleClientId() {
  const buildTimeId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (buildTimeId) return Promise.resolve(buildTimeId);
  clientIdPromise ??= fetch(`${BASE_URL}/user/auth/config`, { credentials: "include" })
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => data.googleClientId || "")
    .catch(() => {
      clientIdPromise = null; // retry on next mount if the API was unreachable
      return "";
    });
  return clientIdPromise;
}

function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  loadPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts?.id
        ? resolve(window.google)
        : reject(new Error("Google sign-in is unavailable"));
    script.onerror = () => {
      loadPromise = null; // allow a retry on the next mount
      script.remove();
      reject(new Error("Couldn't load Google sign-in. Check your connection."));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

/**
 * Load GIS and route credentials to `onCredential`.
 * GIS may only be initialized once per page, so later callers just swap the handler.
 */
export async function setupGoogleIdentity(clientId, onCredential) {
  credentialHandler = onCredential;
  const google = await loadScript();
  if (initializedWith !== clientId) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => credentialHandler?.(response),
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    initializedWith = clientId;
  }
  return google;
}

export function releaseGoogleIdentity(onCredential) {
  if (credentialHandler === onCredential) credentialHandler = null;
}
