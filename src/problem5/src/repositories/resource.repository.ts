import { Prisma } from "@prisma/client";
import prisma from "../database/client";
import {
  Resource,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceFilters,
  ResourceStatus,
} from "../types/resource.types";

type PrismaResource = Prisma.ResourceGetPayload<object>;

const toResource = (record: PrismaResource): Resource => ({
  id: record.id,
  name: record.name,
  description: record.description,
  status: record.status as ResourceStatus,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export class ResourceRepository {
  private buildWhereClause(
    filters: Omit<ResourceFilters, "page" | "limit">,
  ): Prisma.ResourceWhereInput {
    const where: Prisma.ResourceWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.name) where.name = { contains: filters.name };
    return where;
  }

  async findAll(
    filters: ResourceFilters,
  ): Promise<{ records: Resource[]; total: number }> {
    const { page = 1, limit = 20, ...filterParams } = filters;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filterParams);

    const [records, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.resource.count({ where }),
    ]);

    return { records: records.map(toResource), total };
  }

  async findById(id: string): Promise<Resource | null> {
    const record = await prisma.resource.findUnique({ where: { id } });
    return record ? toResource(record) : null;
  }

  async create(data: CreateResourceDto): Promise<Resource> {
    const record = await prisma.resource.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status ?? "active",
      },
    });
    return toResource(record);
  }

  async update(id: string, data: UpdateResourceDto): Promise<Resource> {
    const record = await prisma.resource.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
    return toResource(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.resource.delete({ where: { id } });
  }
}
