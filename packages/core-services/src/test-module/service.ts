import { prisma } from '@repo/database';

export class TestModuleService {
  async getItems(userId: string) {
    return prisma.testModuleItem.findMany({ where: { userId } });
  }

  async createItem(userId: string, name: string) {
    return prisma.testModuleItem.create({ data: { userId, name } });
  }
}
