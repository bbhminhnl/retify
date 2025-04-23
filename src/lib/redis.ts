// lib/redis.ts
import { createClient } from "redis";

/** Khởi tạo client Redis */
const redis = createClient({
  url: process.env.REDIS_URL!,
});

/** Kiểm tra kết nối Redis */
redis.on("error", (err) => console.error("Redis Client Error", err));

/** Kết nối khi khởi động ứng dụng */
(async () => {
  await redis.connect();
})();

export default redis;
