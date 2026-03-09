import { prisma } from '@repo/database';
import bcrypt from 'bcrypt';

export class AuthService {
  async getUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async registerUser(data: { email: string; password?: string; name?: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    let passwordHash = null;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
    });
  }
}
