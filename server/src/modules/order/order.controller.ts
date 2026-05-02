import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler";
import { sendSuccess } from "../../shared/api-response";
import { AppError } from "../../shared/app-error";
import {
  placeOrderService,
  getMyOrdersService,
  cancelOrderService,
} from "./order.service";

export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const { dishId } = req.body;
  if (!dishId) throw new AppError("dishId is required", 400);

  const order = await placeOrderService({
    customerId: req.user.id,
    societyId: req.user.societyId,
    dishId,
    customerLat: req.user.lat,
    customerLng: req.user.lng,
  });

  sendSuccess(res, 201, "Order placed successfully", { order });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await getMyOrdersService({
    userId: req.user.id,
    role: req.user.role,
  });

  sendSuccess(res, 200, "Orders retrieved successfully", { orders });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as unknown as string;
  if (!id) throw new AppError("Order id is required", 400);

  const order = await cancelOrderService({
    customerId: req.user.id,
    orderId: id,
  });

  sendSuccess(res, 200, "Order cancelled successfully", { order });
});
