import http from "http";
import createApp from "./app";
import prisma from "./database/client";
import logger from "./utils/logger";

const PORT = Number(process.env["PORT"] ?? 3000);

const gracefulShutdown = (server: http.Server, signal: string): void => {
  logger.info({ signal }, "Shutdown signal received");

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error closing HTTP server");
      process.exit(1);
    }
    try {
      await prisma.$disconnect();
      logger.info("Database disconnected. Exiting.");
      process.exit(0);
    } catch (disconnectError) {
      logger.error(
        { err: disconnectError },
        "Error disconnecting from database",
      );
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Graceful shutdown timed out. Force exiting.");
    process.exit(1);
  }, 10_000).unref();
};

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connection established");
  } catch (error) {
    logger.fatal({ err: error }, "Failed to connect to database");
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(
      {
        port: PORT,
        env: process.env["NODE_ENV"] ?? "development",
        pid: process.pid,
      },
      `Server running on http://localhost:${PORT}`,
    );
  });

  process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled Promise Rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught Exception");
    process.exit(1);
  });
};

startServer();
