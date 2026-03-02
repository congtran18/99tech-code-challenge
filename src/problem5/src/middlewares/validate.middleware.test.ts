import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "./validate.middleware";

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({ body: {}, query: {}, params: {}, ...overrides }) as unknown as Request;

const mockRes = (): Response => ({}) as Response;
const mockNext = (): NextFunction => jest.fn();

const nameSchema = z.object({ name: z.string().min(1) });

describe("validate middleware", () => {
  describe("body validation (default target)", () => {
    it("should call next() and mutate req.body with parsed data on success", () => {
      const req = mockReq({ body: { name: "hello" } });
      const next = mockNext();

      validate(nameSchema)(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect((req as Request & { body: { name: string } }).body).toEqual({
        name: "hello",
      });
    });

    it("should call next(ZodError) when validation fails", () => {
      const req = mockReq({ body: { name: "" } });
      const next = mockNext();

      validate(nameSchema)(req, mockRes(), next);

      const arg = (next as jest.Mock).mock.calls[0][0];
      expect(arg).toBeDefined();
      expect(arg.issues).toBeDefined();
    });

    it("should not proceed to next() without error when body is invalid", () => {
      const req = mockReq({ body: {} });
      const next = mockNext();

      validate(nameSchema)(req, mockRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((next as jest.Mock).mock.calls[0][0]).toBeDefined();
    });
  });

  describe("query validation", () => {
    it("should validate req.query and mutate it with parsed data", () => {
      const pageSchema = z.object({ page: z.coerce.number().default(1) });
      const req = mockReq({ query: { page: "3" } as never });
      const next = mockNext();

      validate(pageSchema, "query")(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect((req.query as unknown as { page: number }).page).toBe(3);
    });

    it("should call next(ZodError) when query fails", () => {
      const strictSchema = z.object({ id: z.string().min(1) });
      const next = mockNext();

      validate(strictSchema, "query")(
        mockReq({ query: {} as never }),
        mockRes(),
        next,
      );

      expect((next as jest.Mock).mock.calls[0][0]).toBeDefined();
    });
  });

  describe("params validation", () => {
    it("should validate req.params successfully", () => {
      const idSchema = z.object({ id: z.string().min(1) });
      const req = mockReq({ params: { id: "abc-123" } });
      const next = mockNext();

      validate(idSchema, "params")(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it("should call next(ZodError) when params fail", () => {
      const idSchema = z.object({ id: z.string().min(1) });
      const next = mockNext();

      validate(idSchema, "params")(
        mockReq({ params: { id: "" } }),
        mockRes(),
        next,
      );

      expect((next as jest.Mock).mock.calls[0][0]).toBeDefined();
    });
  });
});
