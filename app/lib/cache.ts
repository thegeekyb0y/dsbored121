// lib/cache.ts
import { redis } from "@/lib/redis";

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

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
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
};

export const cacheKeys = {
  userProfile: (userId: string) => `profile:public:v2:${userId}`,
  userProfileSelf: (userId: string) => `profile:self:v2:${userId}`,
  userStats: (userId: string) => `stats:${userId}`,
  roomData: (roomCode: string) => `room:v2:${roomCode}`,
  roomActive: (roomCode: string) => `room-active:v2:${roomCode}`,
  userRooms: (userId: string) => `rooms:user:${userId}`,
  todos: (userId: string) => `todos:${userId}`,
  activeSession: (email: string) => `active-session:${email}`,
};
