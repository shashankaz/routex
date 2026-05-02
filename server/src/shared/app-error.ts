import { StatusCodes } from "./http-status-code";

export class AppError extends Error {
  public readonly statusCode: StatusCodes;
  public readonly details?: unknown;

  constructor(message: string, statusCode: StatusCodes) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
