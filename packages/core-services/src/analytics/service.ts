import { prisma } from '@repo/database';

export class AnalyticsService {
  async trackEvent(eventName: string, userId?: string, payload?: any) {
    return prisma.event.create({
      data: {
        eventName,
        userId,
        payload
      }
    });
  }
}
