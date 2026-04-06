import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
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

client.connect().catch((err) => {
  console.log("Redis connection failed, continuing without Redis");
});

export default client;
