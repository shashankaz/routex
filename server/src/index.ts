import express from "express";
import type { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { router } from "./routes/v1/index";
import { AppError } from "./shared/app-error";
import { sendError } from "./shared/api-response";
import { env } from "./config/config";
import { swaggerSpec } from "./config/swagger";
import { PrismaService } from "./utils/db";

const app = express();

app.disable("x-powered-by");

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));

morgan.token("localdate", function () {
  return new Date().toISOString().replace("Z", "");
});
app.use(
  morgan(
    ':remote-addr - :remote-user [:localdate] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
  ),
);

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "RouteX API is LIVE!" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1", router);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Not Found", 404));
});

const handleGlobalError = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("[Error]", err.message);
  if (env.NODE_ENV === "development") console.error(err.stack);

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  sendError(res, 500, "Internal Server Error");
};

app.use(handleGlobalError);

const PORT = env.PORT ?? 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    await PrismaService.disconnect();
    console.log("[RouteX] Prisma disconnected. Exiting.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
