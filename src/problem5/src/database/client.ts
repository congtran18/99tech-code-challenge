import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const isDevelopment = process.env["NODE_ENV"] !== "production";

const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: isDevelopment
      ? [
          { level: "warn", emit: "stdout" },
          { level: "error", emit: "stdout" },
        ]
      : [{ level: "error", emit: "stdout" }],
  });

if (isDevelopment) {
  global.__prisma = prisma;
}

export default prisma;
