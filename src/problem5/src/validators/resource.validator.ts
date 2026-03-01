import { z } from "zod";
import { ResourceStatus } from "../types/resource.types";

const RESOURCE_STATUSES: [ResourceStatus, ...ResourceStatus[]] = [
  "active",
  "inactive",
  "archived",
];

export const createResourceSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(1, "name must not be empty")
    .max(255, "name must be at most 255 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "description must be at most 2000 characters")
    .trim()
    .optional(),
  status: z.enum(RESOURCE_STATUSES).optional().default("active"),
});

export const updateResourceSchema = z
  .object({
    name: z
      .string()
      .min(1, "name must not be empty")
      .max(255, "name must be at most 255 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, "description must be at most 2000 characters")
      .trim()
      .nullable()
      .optional(),
    status: z.enum(RESOURCE_STATUSES).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

export const listResourcesSchema = z.object({
  status: z.enum(RESOURCE_STATUSES).optional(),
  name: z.string().trim().optional(),
  page: z.coerce
    .number()
    .int()
    .positive("page must be a positive integer")
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "limit must be at least 1")
    .max(100, "limit must be at most 100")
    .optional()
    .default(20),
});

export const resourceIdSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ListResourcesInput = z.infer<typeof listResourcesSchema>;
