import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../shared/app-error.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new AppError(
          result.error.errors.map((e) => e.message).join(", "),
          400,
        ),
      );
    }
    req.body = result.data;
    next();
  };
};
