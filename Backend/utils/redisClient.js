import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log("Redis retry limit reached");
        return new Error("Retry limit reached");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

client.on("connect", () => console.log("Redis connecting..."));
client.on("ready", () => console.log("Redis ready"));
client.on("end", () => console.log("Redis connection closed"));
client.on("reconnecting", () => console.log("Redis reconnecting..."));
client.on("error", (err) => console.log("Redis error:", err.message));

await client.connect();

export default client;
