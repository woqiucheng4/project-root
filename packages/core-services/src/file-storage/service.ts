import { prisma } from '@repo/database';

export class FileStorageService {
  async saveFileRecord(data: { userId: string, fileName: string, fileUrl: string, size: number, mimeType: string }) {
    return prisma.file.create({ data });
  }
}
