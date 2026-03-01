import { Response } from "express";
import { ApiResponse } from "../types/resource.types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Request successful",
  statusCode = 200,
): void => {
  const response: ApiResponse<T> = { status: "success", data, message };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number,
  errors?: Record<string, string[]>,
): void => {
  const response: ApiResponse<never> = {
    status: "error",
    message,
    ...(errors && { errors }),
  };
  res.status(statusCode).json(response);
};
