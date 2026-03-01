import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import {
  globalErrorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import apiRouter from "./routes";
import logger from "./utils/logger";

const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  const allowedOrigins = (
    process.env["CORS_ORIGINS"] ?? "http://localhost:3000"
  ).split(",");
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' is not allowed`));
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      credentials: true,
    }),
  );

  app.use(
    "/api",
    rateLimit({
      windowMs: Number(process.env["RATE_LIMIT_WINDOW_MS"] ?? 900_000),
      max: Number(process.env["RATE_LIMIT_MAX_REQUESTS"] ?? 100),
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: "error",
        message: "Too many requests, please try again later.",
      },
      handler: (req, res, _next, options) => {
        logger.warn(
          { requestId: req.requestId, ip: req.ip },
          "Rate limit exceeded",
        );
        res.status(options.statusCode).json(options.message);
      },
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(requestIdMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", apiRouter);
  app.use(notFoundMiddleware);
  app.use(globalErrorMiddleware);

  return app;
};

export default createApp;
