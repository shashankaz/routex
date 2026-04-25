import { Response } from "express";

import { StatusCodes } from "./http-status-code.js";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure<E = null> = {
  success: false;
  message: string;
  error: E;
};

export type ApiResponse<T, E = null> = ApiSuccess<T> | ApiFailure<E>;

export const sendSuccess = <T>(
  res: Response,
  statusCode: StatusCodes,
  message: string,
  data: T,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = <E = null>(
  res: Response,
  statusCode: StatusCodes,
  message: string,
  error: E = null as E,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
