import { prisma } from '@repo/database';

export class NotificationsService {
  async sendNotification(userId: string, title: string, body: string) {
    return prisma.notification.create({
      data: { userId, title, body }
    });
  }
}
