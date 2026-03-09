import { prisma } from '@repo/database';

export class BillingService {
  async getSubscription(userId: string) {
    return prisma.subscription.findFirst({ where: { userId } });
  }
}
