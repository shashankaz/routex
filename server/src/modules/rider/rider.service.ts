import { prisma } from "../../utils/db.js";
import { AppError } from "../../shared/app-error.js";
import type { OrderStatus } from "../../../generated/prisma/client.js";

const ALLOWED_RIDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  ASSIGNED: ["ACCEPTED"],
  ACCEPTED: ["PICKED_UP"],
  PICKED_UP: ["DELIVERED"],
};

export const toggleAvailabilityService = async ({
  riderId,
}: {
  riderId: string;
}) => {
  const rider = await prisma.user.findUnique({ where: { id: riderId } });
  if (!rider) throw new AppError("Rider not found", 404);

  return prisma.user.update({
    where: { id: riderId },
    data: { isAvailable: !rider.isAvailable },
    select: { id: true, name: true, isAvailable: true },
  });
};

export const getRiderOrdersService = async ({
  riderId,
}: {
  riderId: string;
}) => {
  return prisma.order.findMany({
    where: { riderId },
    include: {
      Dish: {
        select: {
          id: true,
          name: true,
          price: true,
          mediaUrl: true,
          calories: true,
          healthScore: true,
        },
      },
      Customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const acceptOrderService = async ({
  riderId,
  orderId,
}: {
  riderId: string;
  orderId: string;
}) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.riderId !== riderId)
    throw new AppError("This order is not assigned to you", 403);
  if (order.status !== "ASSIGNED")
    throw new AppError(`Cannot accept order with status: ${order.status}`, 409);

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "ACCEPTED" },
    }),
    prisma.user.update({
      where: { id: riderId },
      data: { isAvailable: false },
    }),
  ]);

  return updated;
};

export const updateOrderStatusService = async ({
  riderId,
  orderId,
  status,
}: {
  riderId: string;
  orderId: string;
  status: string;
}) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.riderId !== riderId)
    throw new AppError("This order is not assigned to you", 403);

  const allowed = ALLOWED_RIDER_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status as OrderStatus)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${status}`,
      409,
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  if (status === "DELIVERED") {
    await prisma.user.update({
      where: { id: riderId },
      data: { isAvailable: true },
    });
  }

  return updatedOrder;
};
