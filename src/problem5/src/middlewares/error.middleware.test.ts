import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { AppError } from "../errors/AppError";
import { sendError } from "../utils/response.helper";

jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));
jest.mock("../utils/response.helper");

const mockedSendError = jest.mocked(sendError);

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    method: "GET",
    originalUrl: "/api/test",
    requestId: "req-id",
    ...overrides,
  }) as unknown as Request;

const mockRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as Response;

const mockNext = (): NextFunction => jest.fn();

describe("notFoundMiddleware", () => {
  it("should call next with a 404 AppError containing method and URL", async () => {
    const { notFoundMiddleware } = await import("./error.middleware");
    const req = mockReq({ method: "POST", originalUrl: "/api/unknown" });
    const next = mockNext();

    notFoundMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: "Route 'POST /api/unknown' not found.",
      }),
    );
  });
});

describe("globalErrorMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle ZodError with 400 and field-level errors", async () => {
    const { globalErrorMiddleware } = await import("./error.middleware");
    const schema = z.object({ name: z.string().min(1) });
    const zodError = schema.safeParse({ name: "" }).error as ZodError;

    globalErrorMiddleware(zodError, mockReq(), mockRes(), mockNext());

    expect(mockedSendError).toHaveBeenCalledWith(
      expect.anything(),
      "Validation failed. Please check your input.",
      400,
      expect.objectContaining({ name: expect.any(Array) }),
    );
  });

  it("should handle operational AppError with its own statusCode and message", async () => {
    const { globalErrorMiddleware } = await import("./error.middleware");
    const error = new AppError("Resource not found", 404);

    globalErrorMiddleware(error, mockReq(), mockRes(), mockNext());

    expect(mockedSendError).toHaveBeenCalledWith(
      expect.anything(),
      "Resource not found",
      404,
    );
  });

  it("should handle non-operational errors with 500 and expose message in development", () => {
    // isProduction is evaluated at module load — per default NODE_ENV is 'test',
    // so the development branch is exercised here.
    jest.isolateModules(() => {
      const { globalErrorMiddleware } = jest.requireActual(
        "./error.middleware",
      ) as {
        globalErrorMiddleware: (
          err: Error,
          req: Request,
          res: Response,
          next: NextFunction,
        ) => void;
      };
      const error = new Error("Sensitive internal detail");

      globalErrorMiddleware(error, mockReq(), mockRes(), mockNext());

      expect(mockedSendError).toHaveBeenCalledWith(
        expect.anything(),
        "Sensitive internal detail",
        500,
      );
    });
  });

  it("should mask error message in production for non-operational errors", () => {
    jest.isolateModules(() => {
      process.env["NODE_ENV"] = "production";
      const { globalErrorMiddleware } = jest.requireActual(
        "./error.middleware",
      ) as {
        globalErrorMiddleware: (
          err: Error,
          req: Request,
          res: Response,
          next: NextFunction,
        ) => void;
      };
      const error = new Error("Sensitive internal detail");

      globalErrorMiddleware(error, mockReq(), mockRes(), mockNext());

      expect(mockedSendError).toHaveBeenCalledWith(
        expect.anything(),
        "An unexpected error occurred. Please try again later.",
        500,
      );
      delete process.env["NODE_ENV"];
    });
  });
});
