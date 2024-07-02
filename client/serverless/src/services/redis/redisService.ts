import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://rested-bonefish-52392.upstash.io",
  token: "AcyoAAIncDFkZTZlMTkzMjk2ZmE0YzJhODJkYTIwMDFlNzFmZjdkOXAxNTIzOTI",
});

class RedisService {
  redis: any;
  constructor() {
    this.redis = redis;
  }

  async set(key, value) {
    const result = await this.redis.set(key, value, { ex: 43200 });
    return result;
  }

  async get(key) {
    const result = await this.redis.get(key);
    return result;
  }

  async delete(key) {
    const result = await this.redis.del(key);
    return result;
  }
}
