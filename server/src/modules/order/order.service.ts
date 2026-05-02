import { prisma } from "../../utils/db.js";
import { AppError } from "../../shared/app-error.js";
import { assignNearestRider } from "../matching/matching.service.js";
import type { Role } from "@prisma/client";

export const placeOrderService = async ({
  customerId,
  societyId,
  dishId,
  customerLat,
  customerLng,
}: {
  customerId: string;
  societyId: string;
  dishId: string;
  customerLat?: number | null;
  customerLng?: number | null;
}) => {
  const order = await prisma.$transaction(async (tx) => {
    const dish = await tx.dish.findUnique({ where: { id: dishId } });
    if (!dish) throw new AppError("Dish not found", 404);
    if (dish.isSoldOut || dish.quantity < 1)
      throw new AppError("Dish is sold out", 409);
    if (dish.societyId !== societyId) {
      throw new AppError("Dish is not available in your society", 403);
    }

    const newQty = dish.quantity - 1;

    await tx.dish.update({
      where: { id: dishId },
      data: { quantity: newQty, isSoldOut: newQty === 0 },
    });

    return tx.order.create({
      data: { dishId, customerId, societyId },
    });
  });

  const rider = await assignNearestRider(societyId, customerLat, customerLng);

  if (rider) {
    const assigned = await prisma.order.update({
      where: { id: order.id },
      data: { riderId: rider.id, status: "ASSIGNED" },
      include: {
        Dish: {
          select: {
            id: true,
            name: true,
            price: true,
            calories: true,
            healthScore: true,
            mediaUrl: true,
          },
        },
        Rider: { select: { id: true, name: true } },
      },
    });
    return assigned;
  }

  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      Dish: {
        select: {
          id: true,
          name: true,
          price: true,
          calories: true,
          healthScore: true,
          mediaUrl: true,
        },
      },
    },
  });
};

export const cancelOrderService = async ({
  customerId,
  orderId,
}: {
  customerId: string;
  orderId: string;
}) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.customerId !== customerId) {
    throw new AppError("You can only cancel your own orders", 403);
  }

  const cancellable: string[] = ["PENDING", "ASSIGNED"];
  if (!cancellable.includes(order.status)) {
    throw new AppError(
      `Cannot cancel an order with status: ${order.status}`,
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.dish.update({
      where: { id: order.dishId },
      data: {
        quantity: { increment: 1 },
        isSoldOut: false,
      },
    });

    if (order.riderId) {
      await tx.user.update({
        where: { id: order.riderId },
        data: { isAvailable: true },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });
};

export const getMyOrdersService = async ({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) => {
  const dishSelect = {
    id: true,
    name: true,
    price: true,
    calories: true,
    healthScore: true,
    mediaUrl: true,
    isVeg: true,
    tags: true,
  };

  if (role === "RESIDENT") {
    return prisma.order.findMany({
      where: { customerId: userId },
      include: {
        Dish: { select: dishSelect },
        Rider: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (role === "RIDER") {
    return prisma.order.findMany({
      where: { riderId: userId },
      include: {
        Dish: { select: dishSelect },
        Customer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.order.findMany({
    where: { Dish: { chefId: userId } },
    include: {
      Dish: { select: dishSelect },
      Customer: { select: { id: true, name: true } },
      Rider: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
