import { ResourceRepository } from "./resource.repository";

jest.mock("../database/client", () => ({
  __esModule: true,
  default: {
    resource: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require("../database/client").default as {
  resource: {
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

const makeDbRecord = (overrides: Record<string, unknown> = {}) => ({
  id: "test-id-001",
  name: "Auth Service",
  description: "JWT auth",
  status: "active",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("ResourceRepository", () => {
  let repo: ResourceRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ResourceRepository();
  });

  describe("findAll", () => {
    it("should query with correct skip/take/orderBy and return mapped records", async () => {
      const records = [makeDbRecord(), makeDbRecord({ id: "test-id-002" })];
      prisma.resource.findMany.mockResolvedValue(records);
      prisma.resource.count.mockResolvedValue(2);

      const result = await repo.findAll({ page: 1, limit: 10 });

      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      expect(result.total).toBe(2);
      expect(result.records).toHaveLength(2);
      expect(result.records[0]).toMatchObject({
        id: "test-id-001",
        status: "active",
      });
    });

    it("should compute skip correctly for page 3, limit 10", async () => {
      prisma.resource.findMany.mockResolvedValue([]);
      prisma.resource.count.mockResolvedValue(0);

      await repo.findAll({ page: 3, limit: 10 });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it("should apply status filter", async () => {
      prisma.resource.findMany.mockResolvedValue([]);
      prisma.resource.count.mockResolvedValue(0);

      await repo.findAll({ status: "inactive" });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: "inactive" } }),
      );
    });

    it("should apply name contains filter", async () => {
      prisma.resource.findMany.mockResolvedValue([]);
      prisma.resource.count.mockResolvedValue(0);

      await repo.findAll({ name: "auth" });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: { contains: "auth" } } }),
      );
    });

    it("should apply both status and name filters", async () => {
      prisma.resource.findMany.mockResolvedValue([]);
      prisma.resource.count.mockResolvedValue(0);

      await repo.findAll({ status: "active", name: "service" });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "active", name: { contains: "service" } },
        }),
      );
    });

    it("should run findMany and count in parallel", async () => {
      prisma.resource.findMany.mockResolvedValue([]);
      prisma.resource.count.mockResolvedValue(0);

      await repo.findAll({});

      expect(prisma.resource.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.resource.count).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return mapped resource when found", async () => {
      prisma.resource.findUnique.mockResolvedValue(makeDbRecord());

      const result = await repo.findById("test-id-001");

      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id-001" },
      });
      expect(result?.id).toBe("test-id-001");
      expect(result?.status).toBe("active");
    });

    it("should return null when not found", async () => {
      prisma.resource.findUnique.mockResolvedValue(null);
      expect(await repo.findById("nonexistent")).toBeNull();
    });

    it("should map description: null correctly", async () => {
      prisma.resource.findUnique.mockResolvedValue(
        makeDbRecord({ description: null }),
      );
      const result = await repo.findById("test-id-001");
      expect(result?.description).toBeNull();
    });
  });

  describe("create", () => {
    it("should call prisma.create with correct data and return mapped resource", async () => {
      prisma.resource.create.mockResolvedValue(makeDbRecord());

      const result = await repo.create({
        name: "Auth Service",
        description: "JWT auth",
        status: "active",
      });

      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: {
          name: "Auth Service",
          description: "JWT auth",
          status: "active",
        },
      });
      expect(result.id).toBe("test-id-001");
    });

    it("should default status to active when not provided", async () => {
      prisma.resource.create.mockResolvedValue(makeDbRecord());

      await repo.create({ name: "Auth Service" });

      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: "active" }),
      });
    });
  });

  describe("update", () => {
    it("should call prisma.update with only provided fields", async () => {
      prisma.resource.update.mockResolvedValue(
        makeDbRecord({ status: "inactive" }),
      );

      const result = await repo.update("test-id-001", { status: "inactive" });

      expect(prisma.resource.update).toHaveBeenCalledWith({
        where: { id: "test-id-001" },
        data: { status: "inactive" },
      });
      expect(result.status).toBe("inactive");
    });

    it("should exclude undefined fields from update data", async () => {
      prisma.resource.update.mockResolvedValue(makeDbRecord());

      await repo.update("test-id-001", {
        name: "New Name",
        description: undefined,
        status: undefined,
      });

      const data = prisma.resource.update.mock.calls[0][0].data;
      expect(data).toHaveProperty("name", "New Name");
      expect(data).not.toHaveProperty("description");
      expect(data).not.toHaveProperty("status");
    });

    it("should include description: null to allow clearing it", async () => {
      prisma.resource.update.mockResolvedValue(
        makeDbRecord({ description: null }),
      );

      await repo.update("test-id-001", { description: null });

      expect(prisma.resource.update.mock.calls[0][0].data).toHaveProperty(
        "description",
        null,
      );
    });
  });

  describe("delete", () => {
    it("should call prisma.delete with the correct id", async () => {
      prisma.resource.delete.mockResolvedValue(makeDbRecord());

      await repo.delete("test-id-001");

      expect(prisma.resource.delete).toHaveBeenCalledWith({
        where: { id: "test-id-001" },
      });
    });
  });
});
