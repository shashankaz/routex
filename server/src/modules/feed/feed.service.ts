import { prisma } from "../../utils/db.js";
import type { Prisma } from "../../../generated/prisma/client.js";

type FeedQuery = {
  lowCalorie?: string;
  veg?: string;
  highProtein?: string;
  mealSlot?: string;
};

export const getFeedService = async ({
  societyId,
  query,
}: {
  societyId: string;
  query: FeedQuery;
}) => {
  const where: Prisma.DishWhereInput = {
    societyId,
    isSoldOut: false,
  };

  if (query.lowCalorie === "true") {
    where.calories = { lte: 300 };
  }

  if (query.veg === "true") {
    where.isVeg = true;
  }

  if (query.highProtein === "true") {
    where.tags = { has: "High Protein" };
  }

  if (query.mealSlot && ["BREAKFAST", "LUNCH", "DINNER"].includes(query.mealSlot)) {
    where.OR = [
      { mealSlot: query.mealSlot as "BREAKFAST" | "LUNCH" | "DINNER" },
      { mealSlot: "ANY" },
    ];
  }

  const dishes = await prisma.dish.findMany({
    where,
    include: {
      Chef: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return dishes.map((dish) => ({
    id: dish.id,
    name: dish.name,
    price: dish.price,
    quantity: dish.quantity,
    calories: dish.calories,
    healthScore: dish.healthScore,
    isVeg: dish.isVeg,
    tags: dish.tags,
    mediaUrl: dish.mediaUrl,
    isSoldOut: dish.isSoldOut,
    mealSlot: dish.mealSlot,
    chefId: dish.Chef.id,
    Chef: { id: dish.Chef.id, name: dish.Chef.name },
    createdAt: dish.createdAt,
  }));
};
