import { prisma } from '@repo/database';
import Redis from 'ioredis';

// Singleton Redis client for demonstration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl);

export class FeatureFlagService {
  async isEnabled(key: string, userId?: string): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return false;
    
    if (userId) {
      const userFlag = await prisma.userFeatureFlag.findUnique({
        where: { userId_featureFlagId: { userId, featureFlagId: flag.id } }
      });
      if (userFlag) return userFlag.isEnabled;
    }
    
    return flag.isEnabled;
  }
}
