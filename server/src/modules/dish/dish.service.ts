import { prisma } from "../../utils/db.js";
import { AppError } from "../../shared/app-error.js";
import { estimateNutrition } from "../ai/ai.service.js";

type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "ANY";

type CreateDishInput = {
  name: string;
  price: number;
  quantity: number;
  mediaUrl?: string;
  mealSlot?: MealSlot;
};

type UpdateDishInput = {
  name?: string;
  price?: number;
  quantity?: number;
  mediaUrl?: string;
  mealSlot?: MealSlot;
};

const DISH_SELECT = {
  id: true,
  name: true,
  price: true,
  quantity: true,
  mediaUrl: true,
  calories: true,
  healthScore: true,
  isVeg: true,
  tags: true,
  isSoldOut: true,
  mealSlot: true,
  chefId: true,
  societyId: true,
  createdAt: true,
  Chef: { select: { id: true, name: true } },
} as const;

export const createDishService = async ({
  chefId,
  societyId,
  data,
}: {
  chefId: string;
  societyId: string;
  data: CreateDishInput;
}) => {
  const { name, price, quantity, mediaUrl, mealSlot } = data;

  if (!name || name.trim().length < 2) {
    throw new AppError("Dish name is required (min 2 chars)", 400);
  }
  if (price <= 0) throw new AppError("Price must be greater than 0", 400);
  if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);

  const { calories, healthScore, isVeg, tags } = estimateNutrition(name);

  return prisma.dish.create({
    data: {
      name: name.trim(),
      price,
      quantity,
      mediaUrl: mediaUrl ?? null,
      calories,
      healthScore,
      isVeg,
      tags,
      mealSlot: mealSlot ?? "ANY",
      chefId,
      societyId,
    },
    select: DISH_SELECT,
  });
};

export const getMyDishesService = async ({ chefId }: { chefId: string }) => {
  return prisma.dish.findMany({
    where: { chefId },
    select: DISH_SELECT,
    orderBy: { createdAt: "desc" },
  });
};

export const getDishByIdService = async ({ dishId }: { dishId: string }) => {
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    select: DISH_SELECT,
  });
  if (!dish) throw new AppError("Dish not found", 404);
  return dish;
};

export const updateDishService = async ({
  chefId,
  dishId,
  data,
}: {
  chefId: string;
  dishId: string;
  data: UpdateDishInput;
}) => {
  const dish = await prisma.dish.findFirst({ where: { id: dishId, chefId } });
  if (!dish) throw new AppError("Dish not found or not owned by you", 404);

  const { name, price, quantity, mediaUrl, mealSlot } = data;

  if (name !== undefined && name.trim().length < 2) {
    throw new AppError("Dish name must be at least 2 characters", 400);
  }
  if (price !== undefined && price <= 0) {
    throw new AppError("Price must be greater than 0", 400);
  }
  if (quantity !== undefined && quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  let aiFields: {
    calories?: number;
    healthScore?: number;
    isVeg?: boolean;
    tags?: string[];
  } = {};
  if (name !== undefined) {
    const result = estimateNutrition(name.trim());
    aiFields = {
      calories: result.calories,
      healthScore: result.healthScore,
      isVeg: result.isVeg,
      tags: result.tags,
    };
  }

  return prisma.dish.update({
    where: { id: dishId },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(quantity !== undefined
        ? { quantity, isSoldOut: quantity === 0 }
        : {}),
      ...(mediaUrl !== undefined ? { mediaUrl } : {}),
      ...(mealSlot !== undefined ? { mealSlot } : {}),
      ...aiFields,
    },
    select: DISH_SELECT,
  });
};

export const markDishSoldOutService = async ({
  chefId,
  dishId,
}: {
  chefId: string;
  dishId: string;
}) => {
  const dish = await prisma.dish.findFirst({ where: { id: dishId, chefId } });
  if (!dish) throw new AppError("Dish not found or not owned by you", 404);
  if (dish.isSoldOut) throw new AppError("Dish is already sold out", 409);

  return prisma.dish.update({
    where: { id: dishId },
    data: { isSoldOut: true, quantity: 0 },
    select: DISH_SELECT,
  });
};

export const restockDishService = async ({
  chefId,
  dishId,
  quantity,
}: {
  chefId: string;
  dishId: string;
  quantity: number;
}) => {
  const dish = await prisma.dish.findFirst({ where: { id: dishId, chefId } });
  if (!dish) throw new AppError("Dish not found or not owned by you", 404);

  return prisma.dish.update({
    where: { id: dishId },
    data: { isSoldOut: false, quantity },
    select: DISH_SELECT,
  });
};

export const getChefAnalyticsService = async ({
  chefId,
}: {
  chefId: string;
}) => {
  const dishes = await prisma.dish.findMany({
    where: { chefId },
    include: {
      Orders: {
        where: {
          status: { in: ["DELIVERED", "PICKED_UP", "ACCEPTED", "ASSIGNED"] },
        },
        select: { id: true, status: true, createdAt: true },
      },
    },
  });

  const totalDishes = dishes.length;
  const activeDishes = dishes.filter((d) => !d.isSoldOut).length;

  let totalOrders = 0;
  let totalRevenue = 0;
  let deliveredOrders = 0;

  const dishBreakdown = dishes.map((dish) => {
    const orders = dish.Orders.length;
    const delivered = dish.Orders.filter(
      (o) => o.status === "DELIVERED",
    ).length;
    const revenue = dish.price * delivered;
    totalOrders += orders;
    totalRevenue += revenue;
    deliveredOrders += delivered;
    return {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      orders,
      delivered,
      revenue,
      healthScore: dish.healthScore,
      calories: dish.calories,
      tags: dish.tags,
    };
  });

  const topDish = dishBreakdown.sort((a, b) => b.orders - a.orders)[0] ?? null;

  return {
    totalDishes,
    activeDishes,
    totalOrders,
    deliveredOrders,
    totalRevenue,
    topDish,
    dishes: dishBreakdown,
  };
};
