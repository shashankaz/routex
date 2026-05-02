import { prisma } from "../../utils/db.js";
import { AppError } from "../../shared/app-error.js";
import { verifyPassword, hashPassword } from "../../utils/argon2.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import type { Role } from "@prisma/client";

export const registerUserService = async ({
  name,
  email,
  password,
  role,
  societyId,
}: {
  name: string;
  email: string;
  password: string;
  role: Role;
  societyId: string;
}): Promise<{ userId: string }> => {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const society = await prisma.society.findUnique({ where: { id: societyId } });
  if (!society) {
    throw new AppError("Society not found", 404);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      societyId,
    },
  });

  return { userId: user.id };
};

export const loginUserService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  if (!accessToken || !refreshToken) {
    throw new AppError("Could not generate tokens", 500);
  }

  return { accessToken, refreshToken };
};

export const requireActiveUserByIdService = async ({
  id,
}: {
  id: string;
}): Promise<{
  id: string;
  name: string;
  email: string;
  role: Role;
  societyId: string;
  isAvailable: boolean | null;
  lat: number | null;
  lng: number | null;
}> => {
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
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const refreshAccessTokenService = async ({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<{
  newAccessToken: string;
  newRefreshToken: string;
}> => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  if (!newAccessToken || !newRefreshToken) {
    throw new AppError("Could not generate tokens", 500);
  }

  return { newAccessToken, newRefreshToken };
};

export const logoutUserService = async ({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<{ success: boolean }> => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded?.id) {
    throw new AppError("Unauthorized", 401);
  }

  return { success: true };
};
