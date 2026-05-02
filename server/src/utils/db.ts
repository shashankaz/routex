import { PrismaClient } from "@prisma/client";

export class PrismaService {
  private static prisma: PrismaClient | null = null;

  static getClient(): PrismaClient {
    if (!PrismaService.prisma) {
      PrismaService.prisma = new PrismaClient();
    }

    return PrismaService.prisma;
  }

  static async disconnect() {
    if (PrismaService.prisma) {
      await PrismaService.prisma.$disconnect();
      PrismaService.prisma = null;
    }
  }
}

export const prisma = PrismaService.getClient();
