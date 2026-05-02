import { prisma } from "../../utils/db";
import { AppError } from "../../shared/app-error";

export const getAllSocietiesService = async () => {
  return prisma.society.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, createdAt: true },
  });
};

export const createSocietyService = async ({ name }: { name: string }) => {
  const existing = await prisma.society.findFirst({ where: { name } });
  if (existing) {
    throw new AppError("Society with this name already exists", 409);
  }

  return prisma.society.create({
    data: { name },
    select: { id: true, name: true, createdAt: true },
  });
};

export const getSocietyByIdService = async ({ id }: { id: string }) => {
  const society = await prisma.society.findUnique({
    where: { id },
    select: { id: true, name: true, createdAt: true },
  });
  if (!society) {
    throw new AppError("Society not found", 404);
  }

  return society;
};
