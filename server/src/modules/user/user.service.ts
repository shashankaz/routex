import { prisma } from "../../utils/db";
import { AppError } from "../../shared/app-error";

export const getMyProfileService = async ({ id }: { id: string }) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      societyId: true,
      isAvailable: true,
      lat: true,
      lng: true,
      createdAt: true,
      society: { select: { id: true, name: true } },
    },
  });
  if (!user) throw new AppError("User not found", 404);

  return user;
};

export const updateMyLocationService = async ({
  id,
  lat,
  lng,
}: {
  id: string;
  lat: number;
  lng: number;
}) => {
  return prisma.user.update({
    where: { id },
    data: { lat, lng },
    select: { id: true, lat: true, lng: true },
  });
};

export const updateMyProfileService = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  if (!name || name.trim().length < 2) {
    throw new AppError("Name must be at least 2 characters", 400);
  }

  return prisma.user.update({
    where: { id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, role: true },
  });
};
