import type { NextFunction, Request, Response } from "express";

import {
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService,
} from "./auth.service.js";
import { env } from "../../config/config.js";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import { asyncHandler } from "../../shared/async-handler.js";
import type { Role } from "../../../generated/prisma/client.js";

const isProduction = env.NODE_ENV === "production";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("strict" as const) : ("lax" as const),
  path: "/",
  maxAge: 1000 * 60 * 15, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("strict" as const) : ("lax" as const),
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("__auth_at", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    path: "/",
  });
  res.clearCookie("__auth_rt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    path: "/",
  });
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, role, societyId } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      societyId?: string;
    };

    if (!name || !email || !password || !role || !societyId) {
      throw new AppError(
        "name, email, password, role, and societyId are required",
        400,
      );
    }

    const validRoles: Role[] = ["CHEF", "RESIDENT", "RIDER"];
    if (!validRoles.includes(role as Role)) {
      throw new AppError(`role must be one of: ${validRoles.join(", ")}`, 400);
    }

    const { userId } = await registerUserService({
      name,
      email,
      password,
      role: role as Role,
      societyId,
    });

    sendSuccess(res, 201, "User registered successfully", { userId });
  },
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const { accessToken, refreshToken } = await loginUserService({
    email,
    password,
  });

  res.cookie("__auth_at", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("__auth_rt", refreshToken, REFRESH_COOKIE_OPTIONS);

  sendSuccess(res, 200, "User logged in successfully", { accessToken });
});

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies["__auth_rt"] as string | undefined;
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const { newAccessToken, newRefreshToken } = await refreshAccessTokenService(
      { refreshToken },
    );

    res.cookie("__auth_at", newAccessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("__auth_rt", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 200, "New access token issued", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      clearAuthCookies(res);
    }
    next(error);
  }
};

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const refreshToken = req.cookies["__auth_rt"] as string | undefined;
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  await logoutUserService({ refreshToken });

  clearAuthCookies(res);

  sendSuccess(res, 200, "User logged out successfully", {});
});

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id, name, email, role, societyId, isAvailable, lat, lng } = user;

    sendSuccess(res, 200, "User profile retrieved successfully", {
      id,
      name,
      email,
      role,
      societyId,
      isAvailable,
      lat,
      lng,
    });
  },
);
