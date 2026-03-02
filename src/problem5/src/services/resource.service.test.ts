import { ResourceService } from "./resource.service";
import { ResourceRepository } from "../repositories/resource.repository";
import { Resource } from "../types/resource.types";
import { AppError } from "../errors/AppError";

jest.mock("../repositories/resource.repository");

const MockedRepositoryClass = ResourceRepository as jest.MockedClass<
  typeof ResourceRepository
>;

const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: "test-id-001",
  name: "Test Resource",
  description: "A test resource",
  status: "active",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("ResourceService", () => {
  let service: ResourceService;
  let mockRepo: jest.Mocked<ResourceRepository>;

  beforeEach(() => {
    MockedRepositoryClass.mockClear();
    new MockedRepositoryClass();
    mockRepo = MockedRepositoryClass.mock
      .instances[0] as jest.Mocked<ResourceRepository>;
    service = new ResourceService(mockRepo);
  });

  // ── listResources ──────────────────────────────────────────────────────────

  describe("listResources", () => {
    it("should return paginated results", async () => {
      const records = [makeResource(), makeResource({ id: "test-id-002" })];
      mockRepo.findAll.mockResolvedValue({ records, total: 2 });

      const result = await service.listResources({ page: 1, limit: 10 });

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toEqual(records);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it("should compute totalPages correctly", async () => {
      mockRepo.findAll.mockResolvedValue({ records: [], total: 55 });
      const result = await service.listResources({ page: 2, limit: 10 });
      expect(result.totalPages).toBe(6);
    });

    it("should default page to 1 and limit to 20 when not provided", async () => {
      mockRepo.findAll.mockResolvedValue({ records: [], total: 0 });
      const result = await service.listResources({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  // ── getResourceById ────────────────────────────────────────────────────────

  describe("getResourceById", () => {
    it("should return the resource when it exists", async () => {
      const resource = makeResource();
      mockRepo.findById.mockResolvedValue(resource);

      const result = await service.getResourceById("test-id-001");

      expect(result).toEqual(resource);
      expect(mockRepo.findById).toHaveBeenCalledWith("test-id-001");
    });

    it("should throw 404 AppError when resource is not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getResourceById("nonexistent")).rejects.toThrow(
        AppError,
      );
      await expect(
        service.getResourceById("nonexistent"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── createResource ─────────────────────────────────────────────────────────

  describe("createResource", () => {
    it("should call repository.create and return the created resource", async () => {
      const dto = {
        name: "New Resource",
        description: "Desc",
        status: "active" as const,
      };
      const created = makeResource(dto);
      mockRepo.create.mockResolvedValue(created);

      const result = await service.createResource(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  // ── updateResource ─────────────────────────────────────────────────────────

  describe("updateResource", () => {
    it("should update and return the resource when it exists", async () => {
      const existing = makeResource();
      const updated = makeResource({ name: "Updated", status: "inactive" });
      mockRepo.findById.mockResolvedValue(existing);
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.updateResource("test-id-001", {
        name: "Updated",
        status: "inactive",
      });

      expect(mockRepo.findById).toHaveBeenCalledWith("test-id-001");
      expect(mockRepo.update).toHaveBeenCalledWith("test-id-001", {
        name: "Updated",
        status: "inactive",
      });
      expect(result).toEqual(updated);
    });

    it("should throw 404 when resource does not exist", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateResource("nonexistent", { name: "X" }),
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  // ── deleteResource ─────────────────────────────────────────────────────────

  describe("deleteResource", () => {
    it("should delete the resource when it exists", async () => {
      mockRepo.findById.mockResolvedValue(makeResource());
      mockRepo.delete.mockResolvedValue();

      await service.deleteResource("test-id-001");

      expect(mockRepo.findById).toHaveBeenCalledWith("test-id-001");
      expect(mockRepo.delete).toHaveBeenCalledWith("test-id-001");
    });

    it("should throw 404 when resource does not exist", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.deleteResource("nonexistent")).rejects.toMatchObject(
        { statusCode: 404 },
      );
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
