/**
 * Database seed script.
 *
 * Populates the database with sample Resource records for development/testing.
 * Run with: npm run db:seed
 *
 * Uses `upsert` to be idempotent — safe to run multiple times without duplicates.
 */
import prisma from "./client";
import logger from "../utils/logger";

const seedData = [
  {
    id: "seed-resource-001",
    name: "Authentication Service",
    description: "Handles user authentication and JWT token management.",
    status: "active",
  },
  {
    id: "seed-resource-002",
    name: "Payment Gateway",
    description: "Processes payment transactions via Stripe integration.",
    status: "active",
  },
  {
    id: "seed-resource-003",
    name: "Email Notification Service",
    description: "Sends transactional emails via SendGrid.",
    status: "inactive",
  },
  {
    id: "seed-resource-004",
    name: "File Storage Service",
    description: "Manages file uploads and retrieval via S3.",
    status: "active",
  },
  {
    id: "seed-resource-005",
    name: "Legacy Reporting Module",
    description: "Deprecated reporting module, scheduled for removal.",
    status: "archived",
  },
];

async function seed(): Promise<void> {
  logger.info("Starting database seed...");

  // Use Promise.allSettled for fault tolerance — one failure won't abort the rest
  const results = await Promise.allSettled(
    seedData.map((resource) =>
      prisma.resource.upsert({
        where: { id: resource.id },
        update: {},
        create: resource,
      }),
    ),
  );

  let succeeded = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      succeeded++;
      logger.info(
        { id: result.value.id, name: result.value.name },
        "Seeded resource",
      );
    } else {
      failed++;
      logger.error({ reason: result.reason }, "Failed to seed resource");
    }
  }

  logger.info({ succeeded, failed }, `Seeding complete.`);
}

seed()
  .catch((error) => {
    logger.fatal({ err: error }, "Fatal error during seed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
