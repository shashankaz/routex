import rateLimit from "express-rate-limit";

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
}: {
  windowMs?: number;
  max?: number;
}) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      message: "Too many requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });
};
