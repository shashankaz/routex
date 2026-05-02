import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt";
import { requireActiveUserByIdService } from "../modules/auth/auth.service";
import { AppError } from "../shared/app-error";
import { asyncHandler } from "../shared/async-handler";

export const requireAuthenticatedUser = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const accessToken = req.cookies["__auth_at"] as string | undefined;
    if (!accessToken) {
      throw new AppError("Unauthorized", 401);
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await requireActiveUserByIdService({ id: decoded.id });

    req.user = Object.freeze(user);

    next();
  },
);
