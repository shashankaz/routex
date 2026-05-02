import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { sendSuccess } from "../../shared/api-response.js";
import { getFeedService } from "./feed.service.js";

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const lowCalorie = req.query.lowCalorie as string | undefined;
  const veg = req.query.veg as string | undefined;
  const highProtein = req.query.highProtein as string | undefined;
  const mealSlot = req.query.mealSlot as string | undefined;

  const dishes = await getFeedService({
    societyId: req.user.societyId,
    query: {
      lowCalorie,
      veg,
      highProtein,
      mealSlot,
    },
  });

  sendSuccess(res, 200, "Feed retrieved successfully", { dishes });
});
