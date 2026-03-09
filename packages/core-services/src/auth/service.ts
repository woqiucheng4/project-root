import { prisma } from '@repo/database';

export class AuthService {
  async getUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async createUser(data: { email: string; name?: string }) {
    return prisma.user.create({ data });
  }
}
