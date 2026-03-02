import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "./AppError";

describe("AppError", () => {
  it("should create an AppError with correct properties", () => {
    const error = new AppError("Something went wrong", 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe("AppError");
  });

  it("should allow isOperational to be set false", () => {
    const error = new AppError("Critical bug", 500, false);
    expect(error.isOperational).toBe(false);
  });

  it("should capture stack trace", () => {
    const error = new AppError("Test", 400);
    expect(error.stack).toBeDefined();
  });
});

describe("NotFoundError factory", () => {
  it("should create a 404 AppError with the correct message", () => {
    const error = NotFoundError("Resource", "abc-123");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Resource with id 'abc-123' was not found.");
    expect(error.isOperational).toBe(true);
  });
});

describe("ValidationError factory", () => {
  it("should create a 400 AppError", () => {
    const error = ValidationError("name is required");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("name is required");
  });
});

describe("ConflictError factory", () => {
  it("should create a 409 AppError", () => {
    const error = ConflictError("Resource already exists");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Resource already exists");
  });
});
