import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { sendSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import {
  getAllSocietiesService,
  createSocietyService,
  getSocietyByIdService,
} from "./society.service.js";

export const getAllSocieties = asyncHandler(
  async (_req: Request, res: Response) => {
    const societies = await getAllSocietiesService();

    sendSuccess(res, 200, "Societies retrieved successfully", { societies });
  },
);

export const createSociety = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      throw new AppError("Society name is required (min 2 chars)", 400);
    }

    const society = await createSocietyService({ name: name.trim() });

    sendSuccess(res, 201, "Society created successfully", { society });
  },
);

export const getSocietyById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as unknown as string;
    if (!id) throw new AppError("Society id is required", 400);

    const society = await getSocietyByIdService({ id });

    sendSuccess(res, 200, "Society retrieved successfully", { society });
  },
);
