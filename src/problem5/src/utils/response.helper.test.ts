import { Response } from "express";
import { sendSuccess, sendError } from "./response.helper";

const mockRes = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }) as unknown as Response;

describe("sendSuccess", () => {
  it("should respond 200 with success envelope by default", () => {
    const res = mockRes();
    sendSuccess(res, { id: "1", name: "Test" }, "Done");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: { id: "1", name: "Test" },
      message: "Done",
    });
  });

  it("should use custom status code", () => {
    const res = mockRes();
    sendSuccess(res, { id: "1" }, "Created", 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should use default message when not provided", () => {
    const res = mockRes();
    sendSuccess(res, null);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Request successful" }),
    );
  });
});

describe("sendError", () => {
  it("should respond with error envelope", () => {
    const res = mockRes();
    sendError(res, "Not found", 404);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Not found",
    });
  });

  it("should include errors field when provided", () => {
    const res = mockRes();
    const errors = { name: ["name is required"] };
    sendError(res, "Validation failed", 400, errors);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Validation failed",
      errors,
    });
  });

  it("should not include errors field when not provided", () => {
    const res = mockRes();
    sendError(res, "Server error", 500);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call).not.toHaveProperty("errors");
  });
});
