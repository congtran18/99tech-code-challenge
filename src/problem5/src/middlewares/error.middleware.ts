import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { sendError } from "../utils/response.helper";
import logger from "../utils/logger";

const isProduction = process.env["NODE_ENV"] === "production";

export const globalErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".") || "root";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    logger.warn({ requestId: req.requestId, errors }, "Validation error");
    sendError(res, "Validation failed. Please check your input.", 400, errors);
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    logger.warn(
      {
        requestId: req.requestId,
        statusCode: err.statusCode,
        message: err.message,
      },
      "Operational error",
    );
    sendError(res, err.message, err.statusCode);
    return;
  }

  logger.error(
    {
      requestId: req.requestId,
      err: {
        name: err.name,
        message: err.message,
        stack: isProduction ? undefined : err.stack,
      },
    },
    "Unhandled server error",
  );

  sendError(
    res,
    isProduction
      ? "An unexpected error occurred. Please try again later."
      : err.message,
    500,
  );
};

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(`Route '${req.method} ${req.originalUrl}' not found.`, 404),
  );
};
