import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import {
  toggleAvailabilityService,
  getRiderOrdersService,
  acceptOrderService,
  updateOrderStatusService,
} from "./rider.service.js";

const VALID_RIDER_STATUSES = ["PICKED_UP", "DELIVERED"];

export const toggleAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await toggleAvailabilityService({ riderId: req.user.id });
    sendSuccess(res, 200, "Availability updated", result);
  },
);

export const getRiderOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await getRiderOrdersService({ riderId: req.user.id });
    sendSuccess(res, 200, "Orders retrieved successfully", { orders });
  },
);

export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.orderId as unknown as string;
  if (!orderId) throw new AppError("orderId is required", 400);

  const order = await acceptOrderService({
    riderId: req.user.id,
    orderId,
  });

  sendSuccess(res, 200, "Order accepted successfully", { order });
});

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as unknown as string;
    const { status } = req.body as { status?: string };

    if (!orderId) throw new AppError("orderId is required", 400);
    if (!status) throw new AppError("status is required", 400);
    if (!VALID_RIDER_STATUSES.includes(status)) {
      throw new AppError(
        `status must be one of: ${VALID_RIDER_STATUSES.join(", ")}`,
        400,
      );
    }

    const order = await updateOrderStatusService({
      riderId: req.user.id,
      orderId,
      status,
    });

    sendSuccess(res, 200, "Order status updated", { order });
  },
);
