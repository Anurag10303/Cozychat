import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

// detect TLS automatically from URL
const isTLS = REDIS_URL?.startsWith("rediss://");

const client = createClient({
  url: REDIS_URL,

  socket: {
    // ✅ ONLY enable TLS for rediss:// (Upstash)
    ...(isTLS && {
      tls: true,
      rejectUnauthorized: false, // required for Upstash free tier
    }),

    // ✅ controlled retry (no infinite crash loops)
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log("❌ Redis max retries reached, giving up");
        return false; // stop retrying
      }
      console.log(`🔁 Redis retry attempt: ${retries}`);
      return Math.min(retries * 500, 5000);
    },
  },
});

// 🔥 event listeners (for debugging + visibility)
client.on("connect", () => console.log("🔌 Redis connecting..."));
client.on("ready", () => console.log("✅ Redis ready"));
client.on("end", () => console.log("❌ Redis connection closed"));
client.on("reconnecting", () => console.log("🔁 Redis reconnecting..."));
client.on("error", (err) => console.log("❌ Redis error:", err.message));

// ✅ non-blocking connect (IMPORTANT)
(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.log(
      "⚠️ Redis connection failed, continuing without Redis:",
      err.message,
    );
  }
})();

export default client;
