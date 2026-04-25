import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/app-error.js";
import type { Role } from "../../generated/prisma/client.js";

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };
};
