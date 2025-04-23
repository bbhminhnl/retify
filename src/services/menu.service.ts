// services/menu.service.ts
import redisClient from "@/lib/redis";

const DEFAULT_TTL = 86400; // 24 giờ (tính bằng giây)

export const saveMenuToRedis = async (
  key: string,
  menuData: any,
  ttl = DEFAULT_TTL
): Promise<boolean> => {
  try {
    // Lưu dữ liệu dưới dạng JSON string
    await redisClient.setEx(key, ttl, JSON.stringify(menuData));
    return true;
  } catch (error) {
    console.error("Error saving menu to Redis:", error);
    return false;
  }
};

export const getMenuFromRedis = async (key: string): Promise<any | null> => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting menu from Redis:", error);
    return null;
  }
};

export const deleteMenuFromRedis = async (key: string): Promise<boolean> => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Error deleting menu from Redis:", error);
    return false;
  }
};
