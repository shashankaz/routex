import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { sendSuccess } from "../../shared/api-response";
import { AppError } from "../../shared/app-error";
import {
  getMyProfileService,
  updateMyLocationService,
  updateMyProfileService,
} from "./user.service";

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getMyProfileService({ id: req.user.id });

    sendSuccess(res, 200, "Profile retrieved successfully", { user });
  },
);

export const updateMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name) throw new AppError("name is required", 400);
    const user = await updateMyProfileService({ id: req.user.id, name });

    sendSuccess(res, 200, "Profile updated successfully", { user });
  },
);

export const updateMyLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { lat, lng } = req.body as { lat?: number; lng?: number };
    if (lat === undefined || lng === undefined) {
      throw new AppError("lat and lng are required", 400);
    }
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new AppError("lat and lng must be numbers", 400);
    }

    const result = await updateMyLocationService({
      id: req.user.id,
      lat,
      lng,
    });

    sendSuccess(res, 200, "Location updated successfully", result);
  },
);
