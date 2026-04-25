import { PrismaClient } from "../../generated/prisma/client.js";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern — prevents multiple PrismaClient instances in dev (hot reload)
const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__prisma = prisma;
}

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
