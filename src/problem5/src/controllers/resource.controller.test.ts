import { Request, Response, NextFunction } from "express";
import { ResourceController } from "./resource.controller";
import { resourceService } from "../services/resource.service";
import { sendSuccess } from "../utils/response.helper";
import { Resource } from "../types/resource.types";

jest.mock("../utils/response.helper");
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));
jest.mock("../database/client", () => ({
  __esModule: true,
  default: { resource: {} },
}));

const mockedSendSuccess = jest.mocked(sendSuccess);

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: "test-id-001",
  name: "Test Resource",
  description: "desc",
  status: "active",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    params: {},
    body: {},
    query: {},
    requestId: "req-test-id",
    ...overrides,
  }) as unknown as Request;

const mockRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }) as unknown as Response;

const mockNext = (): NextFunction => jest.fn();

describe("ResourceController", () => {
  let controller: ResourceController;

  beforeEach(() => {
    controller = new ResourceController();
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should call listResources with query and send success", async () => {
      const paginatedResult = {
        data: [makeResource()],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      const spy = jest
        .spyOn(resourceService, "listResources")
        .mockResolvedValue(paginatedResult);
      const req = mockReq({ query: { status: "active" } as never });
      const res = mockRes();
      const next = mockNext();

      await controller.list(req, res, next);

      expect(spy).toHaveBeenCalledWith(req.query);
      expect(mockedSendSuccess).toHaveBeenCalledWith(
        res,
        paginatedResult,
        "Resources retrieved successfully",
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next(error) when service throws", async () => {
      const error = new Error("DB error");
      jest.spyOn(resourceService, "listResources").mockRejectedValue(error);
      const next = mockNext();

      await controller.list(mockReq({ query: {} as never }), mockRes(), next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockedSendSuccess).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should call getResourceById with id param and send success", async () => {
      const resource = makeResource();
      const spy = jest
        .spyOn(resourceService, "getResourceById")
        .mockResolvedValue(resource);
      const req = mockReq({ params: { id: "test-id-001" } });
      const res = mockRes();

      await controller.getById(req, res, mockNext());

      expect(spy).toHaveBeenCalledWith("test-id-001");
      expect(mockedSendSuccess).toHaveBeenCalledWith(
        res,
        resource,
        "Resource retrieved successfully",
      );
    });

    it("should call next(error) when service throws", async () => {
      const error = new Error("Not found");
      jest.spyOn(resourceService, "getResourceById").mockRejectedValue(error);
      const next = mockNext();

      await controller.getById(
        mockReq({ params: { id: "x" } }),
        mockRes(),
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("create", () => {
    it("should call createResource with body and respond 201", async () => {
      const resource = makeResource();
      const body = { name: "Test Resource", status: "active" as const };
      const spy = jest
        .spyOn(resourceService, "createResource")
        .mockResolvedValue(resource);
      const res = mockRes();

      await controller.create(mockReq({ body }), res, mockNext());

      expect(spy).toHaveBeenCalledWith(body);
      expect(mockedSendSuccess).toHaveBeenCalledWith(
        res,
        resource,
        "Resource created successfully",
        201,
      );
    });

    it("should call next(error) when service throws", async () => {
      const error = new Error("Conflict");
      jest.spyOn(resourceService, "createResource").mockRejectedValue(error);
      const next = mockNext();

      await controller.create(
        mockReq({ body: { name: "X" } }),
        mockRes(),
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("update", () => {
    it("should call updateResource with id and body, then send success", async () => {
      const updated = makeResource({ status: "inactive" });
      const spy = jest
        .spyOn(resourceService, "updateResource")
        .mockResolvedValue(updated);
      const req = mockReq({
        params: { id: "test-id-001" },
        body: { status: "inactive" },
      });
      const res = mockRes();

      await controller.update(req, res, mockNext());

      expect(spy).toHaveBeenCalledWith("test-id-001", { status: "inactive" });
      expect(mockedSendSuccess).toHaveBeenCalledWith(
        res,
        updated,
        "Resource updated successfully",
      );
    });

    it("should call next(error) when service throws", async () => {
      const error = new Error("Not found");
      jest.spyOn(resourceService, "updateResource").mockRejectedValue(error);
      const next = mockNext();

      await controller.update(
        mockReq({ params: { id: "x" }, body: { name: "Y" } }),
        mockRes(),
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("delete", () => {
    it("should call deleteResource and respond 204 with no content", async () => {
      const spy = jest
        .spyOn(resourceService, "deleteResource")
        .mockResolvedValue();
      const res = mockRes();

      await controller.delete(
        mockReq({ params: { id: "test-id-001" } }),
        res,
        mockNext(),
      );

      expect(spy).toHaveBeenCalledWith("test-id-001");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(mockedSendSuccess).not.toHaveBeenCalled();
    });

    it("should call next(error) when service throws", async () => {
      const error = new Error("Not found");
      jest.spyOn(resourceService, "deleteResource").mockRejectedValue(error);
      const next = mockNext();

      await controller.delete(
        mockReq({ params: { id: "ghost" } }),
        mockRes(),
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
      expect(mockRes().status).not.toHaveBeenCalled();
    });
  });
});
