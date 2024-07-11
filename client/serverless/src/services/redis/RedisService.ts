import { Redis } from "@upstash/redis";

import { AzureKeyVaultService } from "../azure/AzureService";

const AzureKeyVault: AzureKeyVaultService = new AzureKeyVaultService();

class RedisService {
  private redis: Redis;
  constructor() {
    this.initialize();

    // this.redis = null;
    // this.initialize();
  }

  private async initialize() {
    const redisUrl: string = await AzureKeyVault.getSecret("RedisUrl");
    const token: string = await AzureKeyVault.getSecret("RedisToken");
    this.redis = new Redis({
      url: redisUrl,
      token: token,
    });
    return;
  }

  public async set(key: string, value: string): Promise<boolean> {
    try {
      const oneDayInSeconds = 86400;
      await this.redis.set(key, value, { ex: oneDayInSeconds });
      return true;
    } catch (error) {
      return error;
    }
  }

  public async get(key: string): Promise<any> {
    return await this.redis.get(key);
  }

  public async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      return error;
    }
  }
}

export default RedisService;

// // export const RedisService = "Redis";
