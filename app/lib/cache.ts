// lib/cache.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  // Get cached data with automatic JSON parsing
  async get<T>(key: string): Promise<T | null> {
    try {
      // Upstash automatically parses JSON
      const data = await redis.get<T>(key);
      return data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttl });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  },

  // Delete cached data
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache del error:", error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache invalidate error:", error);
    }
  },
};

export const cacheKeys = {
  userProfile: (userId: string) => `profile:${userId}`,
  userStats: (userId: string) => `stats:${userId}`,
  roomData: (roomCode: string) => `room:${roomCode}`,
  userRooms: (userId: string) => `rooms:user:${userId}`,
  todos: (userId: string) => `todos:${userId}`,
};
