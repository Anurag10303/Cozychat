import "dotenv/config";

// Frontend origins allowed to call the API and open sockets.
// Configure with CLIENT_URL (comma-separated), e.g.
//   CLIENT_URL=http://localhost:5173,https://cozychat1.onrender.com
// The defaults keep local development and the current deployment working.
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://cozychat1.onrender.com",
];

const normalize = (url) => url.trim().replace(/\/+$/, "").toLowerCase();

const allowedOrigins = [
  ...new Set(
    [...DEFAULT_ORIGINS, ...(process.env.CLIENT_URL || "").split(",")]
      .map(normalize)
      .filter(Boolean),
  ),
];

/** CORS origin callback shared by Express and Socket.IO. */
export const corsOrigin = (origin, callback) => {
  // Same-origin requests and non-browser clients send no Origin header.
  if (!origin || allowedOrigins.includes(normalize(origin))) return callback(null, true);
  callback(null, false);
};

export default allowedOrigins;
