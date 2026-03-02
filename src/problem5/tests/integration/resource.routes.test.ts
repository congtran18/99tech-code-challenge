/**
 * Integration tests for all resource routes.
 *
 * Prisma client is mocked at module level — no real database needed.
 * All 5 CRUD endpoints are tested: create, list, getById, update, delete.
 */

import request from "supertest";
import createApp from "../../src/app";
import { Application } from "express";

// ─── Mock Prisma ─────────────────────────────────────────────────────────────

jest.mock("../../src/database/client", () => ({
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
const prisma = require("../../src/database/client").default as {
  resource: {
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeDbRecord = (overrides: Record<string, unknown> = {}) => ({
  id: "cmm_test001",
  name: "Auth Service",
  description: "JWT auth",
  status: "active",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

// ─── Setup ───────────────────────────────────────────────────────────────────

let app: Application;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── POST /api/resources ──────────────────────────────────────────────────────

describe("POST /api/resources", () => {
  it("201 — creates a resource with all fields", async () => {
    prisma.resource.create.mockResolvedValue(makeDbRecord());

    const res = await request(app)
      .post("/api/resources")
      .send({
        name: "Auth Service",
        description: "JWT auth",
        status: "active",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.id).toBe("cmm_test001");
    expect(res.body.message).toBe("Resource created successfully");
  });

  it("201 — creates with defaults when only name provided", async () => {
    prisma.resource.create.mockResolvedValue(
      makeDbRecord({ description: null }),
    );

    const res = await request(app)
      .post("/api/resources")
      .send({ name: "Auth Service" });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("active");
  });

  it("400 — fails when name is missing", async () => {
    const res = await request(app)
      .post("/api/resources")
      .send({ description: "No name" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("name");
    expect(prisma.resource.create).not.toHaveBeenCalled();
  });

  it("400 — fails when name is empty string", async () => {
    const res = await request(app).post("/api/resources").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("name");
  });

  it("400 — fails when status is invalid", async () => {
    const res = await request(app)
      .post("/api/resources")
      .send({ name: "Test", status: "unknown" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("status");
  });

  it("400 — fails when name exceeds 255 characters", async () => {
    const res = await request(app)
      .post("/api/resources")
      .send({ name: "a".repeat(256) });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/resources ───────────────────────────────────────────────────────

describe("GET /api/resources", () => {
  it("200 — returns paginated list of all resources", async () => {
    const records = [
      makeDbRecord(),
      makeDbRecord({ id: "cmm_test002", name: "Gateway" }),
    ];
    prisma.resource.findMany.mockResolvedValue(records);
    prisma.resource.count.mockResolvedValue(2);

    const res = await request(app).get("/api/resources");

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(20);
    expect(res.body.data.totalPages).toBe(1);
  });

  it("200 — returns empty list when no resources exist", async () => {
    prisma.resource.findMany.mockResolvedValue([]);
    prisma.resource.count.mockResolvedValue(0);

    const res = await request(app).get("/api/resources");

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(0);
  });

  it("200 — accepts status filter", async () => {
    prisma.resource.findMany.mockResolvedValue([makeDbRecord()]);
    prisma.resource.count.mockResolvedValue(1);

    const res = await request(app).get("/api/resources?status=active");

    expect(res.status).toBe(200);
    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "active" }),
      }),
    );
  });

  it("200 — accepts name filter", async () => {
    prisma.resource.findMany.mockResolvedValue([makeDbRecord()]);
    prisma.resource.count.mockResolvedValue(1);

    const res = await request(app).get("/api/resources?name=Auth");

    expect(res.status).toBe(200);
    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ name: { contains: "Auth" } }),
      }),
    );
  });

  it("200 — accepts pagination and computes skip/take correctly", async () => {
    prisma.resource.findMany.mockResolvedValue([]);
    prisma.resource.count.mockResolvedValue(50);

    const res = await request(app).get("/api/resources?page=3&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(3);
    expect(res.body.data.totalPages).toBe(5);
    expect(prisma.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("400 — fails with invalid status filter", async () => {
    const res = await request(app).get("/api/resources?status=deleted");
    expect(res.status).toBe(400);
    expect(prisma.resource.findMany).not.toHaveBeenCalled();
  });

  it("400 — fails when limit exceeds 100", async () => {
    const res = await request(app).get("/api/resources?limit=999");
    expect(res.status).toBe(400);
  });

  it("400 — fails when page is 0", async () => {
    const res = await request(app).get("/api/resources?page=0");
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/resources/:id ───────────────────────────────────────────────────

describe("GET /api/resources/:id", () => {
  it("200 — returns the resource when found", async () => {
    prisma.resource.findUnique.mockResolvedValue(makeDbRecord());

    const res = await request(app).get("/api/resources/cmm_test001");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("cmm_test001");
    expect(res.body.message).toBe("Resource retrieved successfully");
  });

  it("404 — returns error when resource not found", async () => {
    prisma.resource.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/resources/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toContain("does-not-exist");
  });
});

// ─── PUT /api/resources/:id ───────────────────────────────────────────────────

describe("PUT /api/resources/:id", () => {
  it("200 — updates the resource with valid partial data", async () => {
    prisma.resource.findUnique.mockResolvedValue(makeDbRecord());
    prisma.resource.update.mockResolvedValue(
      makeDbRecord({ status: "inactive", updatedAt: new Date("2026-06-01") }),
    );

    const res = await request(app)
      .put("/api/resources/cmm_test001")
      .send({ status: "inactive" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("inactive");
    expect(res.body.message).toBe("Resource updated successfully");
  });

  it("200 — clears description when set to null", async () => {
    prisma.resource.findUnique.mockResolvedValue(makeDbRecord());
    prisma.resource.update.mockResolvedValue(
      makeDbRecord({ description: null }),
    );

    const res = await request(app)
      .put("/api/resources/cmm_test001")
      .send({ description: null });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBeNull();
  });

  it("404 — returns error when resource not found", async () => {
    prisma.resource.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/resources/nonexistent")
      .send({ name: "New name" });

    expect(res.status).toBe(404);
    expect(prisma.resource.update).not.toHaveBeenCalled();
  });

  it("400 — fails when body is empty", async () => {
    const res = await request(app).put("/api/resources/cmm_test001").send({});

    expect(res.status).toBe(400);
    expect(res.body.errors?.root).toBeDefined();
    expect(prisma.resource.findUnique).not.toHaveBeenCalled();
  });

  it("400 — fails with invalid status", async () => {
    const res = await request(app)
      .put("/api/resources/cmm_test001")
      .send({ status: "gone" });
    expect(res.status).toBe(400);
  });

  it("400 — fails when name is empty string", async () => {
    const res = await request(app)
      .put("/api/resources/cmm_test001")
      .send({ name: "" });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/resources/:id ────────────────────────────────────────────────

describe("DELETE /api/resources/:id", () => {
  it("204 — deletes the resource and returns no content", async () => {
    prisma.resource.findUnique.mockResolvedValue(makeDbRecord());
    prisma.resource.delete.mockResolvedValue(makeDbRecord());

    const res = await request(app).delete("/api/resources/cmm_test001");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(prisma.resource.delete).toHaveBeenCalledWith({
      where: { id: "cmm_test001" },
    });
  });

  it("404 — returns error when resource not found", async () => {
    prisma.resource.findUnique.mockResolvedValue(null);

    const res = await request(app).delete("/api/resources/ghost-id");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(prisma.resource.delete).not.toHaveBeenCalled();
  });
});

// ─── Unknown Routes ───────────────────────────────────────────────────────────

describe("Unknown routes", () => {
  it("404 — unknown API route returns structured error", async () => {
    const res = await request(app).get("/api/unknown-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toContain("not found");
  });
});
