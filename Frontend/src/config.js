// API base URL. Set VITE_API_URL for a separate API host; otherwise production
// builds call the origin they're served from (the backend serves the SPA).
const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? window.location.origin : "http://localhost:3000")
).replace(/\/+$/, "");

export default BASE_URL;
