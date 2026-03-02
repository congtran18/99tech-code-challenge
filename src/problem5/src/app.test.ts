import request from "supertest";
import createApp from "./app";
import { Application } from "express";

jest.mock("./utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));
jest.mock("./database/client", () => ({
  __esModule: true,
  default: {
    resource: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

describe("App", () => {
  let app: Application;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env["CORS_ORIGINS"];
    delete process.env["RATE_LIMIT_MAX_REQUESTS"];
    delete process.env["RATE_LIMIT_WINDOW_MS"];
  });

  describe("GET /health", () => {
    it("should return 200 with status ok and timestamp", async () => {
      app = createApp();
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.timestamp).toBeDefined();
      expect(new Date(res.body.timestamp as string).toISOString()).toBe(
        res.body.timestamp,
      );
    });
  });

  describe("CORS", () => {
    it("should allow requests with no origin (same-origin or server-to-server)", async () => {
      app = createApp();
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
    });

    it("should allow requests from an allowed origin", async () => {
      process.env["CORS_ORIGINS"] = "http://myapp.local";
      app = createApp();

      const res = await request(app)
        .get("/health")
        .set("Origin", "http://myapp.local");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBe(
        "http://myapp.local",
      );
    });

    it("should block requests from a disallowed origin with 500 CORS error", async () => {
      process.env["CORS_ORIGINS"] = "http://allowed.local";
      app = createApp();

      const res = await request(app)
        .get("/health")
        .set("Origin", "http://evil.domain");

      expect(res.status).toBe(500);
    });
  });

  describe("Rate limiting", () => {
    it("should return 429 after exceeding the request limit", async () => {
      process.env["RATE_LIMIT_MAX_REQUESTS"] = "1";
      process.env["RATE_LIMIT_WINDOW_MS"] = "60000";
      app = createApp();

      await request(app).get("/api/resources");
      const res = await request(app).get("/api/resources");

      expect(res.status).toBe(429);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toContain("Too many requests");
    });
  });
});
