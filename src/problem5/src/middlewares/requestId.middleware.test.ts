import { Request, Response, NextFunction } from "express";
import { requestIdMiddleware } from "./requestId.middleware";

const mockReq = (headers: Record<string, string> = {}): Request =>
  ({ headers }) as unknown as Request;

const mockRes = (): Response & { headers: Record<string, string> } => {
  const headers: Record<string, string> = {};
  return {
    headers,
    setHeader: jest.fn((key: string, value: string) => {
      headers[key] = value;
    }),
  } as unknown as Response & { headers: Record<string, string> };
};

const mockNext = (): NextFunction => jest.fn();

describe("requestIdMiddleware", () => {
  it("should use x-request-id from header when provided", () => {
    const req = mockReq({ "x-request-id": "my-custom-id" });
    const res = mockRes();
    const next = mockNext();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe("my-custom-id");
    expect(res.headers["X-Request-Id"]).toBe("my-custom-id");
    expect(next).toHaveBeenCalled();
  });

  it("should generate a UUID when x-request-id header is absent", () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(res.headers["X-Request-Id"]).toBe(req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it("should generate unique IDs for different requests", () => {
    const req1 = mockReq();
    const req2 = mockReq();

    requestIdMiddleware(req1, mockRes(), mockNext());
    requestIdMiddleware(req2, mockRes(), mockNext());

    expect(req1.requestId).not.toBe(req2.requestId);
  });
});
