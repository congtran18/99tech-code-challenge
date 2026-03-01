/**
 * Operational error with a specific HTTP status code.
 *
 * Distinguishes predictable user-facing errors (isOperational = true) from
 * programming bugs so the global error middleware knows what to expose.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const NotFoundError = (resource: string, id: string): AppError =>
  new AppError(`${resource} with id '${id}' was not found.`, 404);

export const ValidationError = (message: string): AppError =>
  new AppError(message, 400);

export const ConflictError = (message: string): AppError =>
  new AppError(message, 409);
