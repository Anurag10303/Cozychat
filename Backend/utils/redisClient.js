import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL, // ✅ must be rediss:// not redis:// for Upstash
  socket: {
    tls: true,                // ✅ Upstash requires TLS
    rejectUnauthorized: false, // ✅ needed for Upstash's self-signed cert on free tier
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log("Redis max retries reached, giving up");
        return false; // ✅ stop retrying instead of crashing
      }
      console.log(`Redis retry attempt: ${retries}`);
      return Math.min(retries * 500, 5000);
    },
  },
});

client.on("connect", () => console.log("Redis connecting..."));
client.on("ready", () => console.log("Redis ready"));
client.on("end", () => console.log("Redis connection closed"));
client.on("reconnecting", () => console.log("Redis reconnecting..."));
client.on("error", (err) => console.log("Redis error:", err.message));

// ✅ Non-blocking connect — app starts even if Redis is down
client.connect().catch((err) => {
  console.log("Redis connection failed, continuing without Redis:", err.message);
});

export default client;