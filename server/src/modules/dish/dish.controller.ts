import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { sendSuccess } from "../../shared/api-response";
import { AppError } from "../../shared/app-error";
import {
  createDishService,
  getMyDishesService,
  getDishByIdService,
  updateDishService,
  markDishSoldOutService,
  restockDishService,
  getChefAnalyticsService,
} from "./dish.service";

export const createDish = asyncHandler(async (req: Request, res: Response) => {
  const { name, price, quantity, mediaUrl, mealSlot } = req.body;

  if (!name || price === undefined || quantity === undefined) {
    throw new AppError("name, price, and quantity are required", 400);
  }

  const dish = await createDishService({
    chefId: req.user.id,
    societyId: req.user.societyId,
    data: {
      name,
      price: Number(price),
      quantity: Number(quantity),
      mediaUrl,
      mealSlot,
    },
  });

  sendSuccess(res, 201, "Dish created successfully", { dish });
});

export const getMyDishes = asyncHandler(async (req: Request, res: Response) => {
  const dishes = await getMyDishesService({ chefId: req.user.id });

  sendSuccess(res, 200, "Dishes retrieved successfully", { dishes });
});

export const getDishById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as unknown as string;
  if (!id) throw new AppError("Dish id is required", 400);

  const dish = await getDishByIdService({ dishId: id });

  sendSuccess(res, 200, "Dish retrieved successfully", { dish });
});

export const updateDish = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as unknown as string;
  if (!id) throw new AppError("Dish id is required", 400);

  const { name, price, quantity, mediaUrl, mealSlot } = req.body as {
    name?: string;
    price?: number;
    quantity?: number;
    mediaUrl?: string;
    mealSlot?: string;
  };

  if (
    name === undefined &&
    price === undefined &&
    quantity === undefined &&
    mediaUrl === undefined &&
    mealSlot === undefined
  ) {
    throw new AppError("At least one field to update is required", 400);
  }

  const dish = await updateDishService({
    chefId: req.user.id,
    dishId: id,
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
      ...(mediaUrl !== undefined ? { mediaUrl } : {}),
      ...(mealSlot !== undefined
        ? { mealSlot: mealSlot as "BREAKFAST" | "LUNCH" | "DINNER" | "ANY" }
        : {}),
    },
  });

  sendSuccess(res, 200, "Dish updated successfully", { dish });
});

export const markSoldOut = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as unknown as string;
  if (!id) throw new AppError("Dish id is required", 400);

  const dish = await markDishSoldOutService({
    chefId: req.user.id,
    dishId: id,
  });

  sendSuccess(res, 200, "Dish marked as sold out", { dish });
});

export const restockDish = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as unknown as string;
  if (!id) throw new AppError("Dish id is required", 400);

  const { quantity } = req.body;
  if (quantity === undefined || Number(quantity) < 1) {
    throw new AppError("quantity must be at least 1", 400);
  }

  const dish = await restockDishService({
    chefId: req.user.id,
    dishId: id,
    quantity: Number(quantity),
  });

  sendSuccess(res, 200, "Dish restocked successfully", { dish });
});

export const getChefAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const analytics = await getChefAnalyticsService({ chefId: req.user.id });

    sendSuccess(res, 200, "Chef analytics retrieved", { analytics });
  },
);
