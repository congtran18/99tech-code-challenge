import { ResourceRepository } from "../repositories/resource.repository";
import { NotFoundError } from "../errors/AppError";
import {
  Resource,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceFilters,
  PaginatedResponse,
} from "../types/resource.types";

export class ResourceService {
  constructor(private readonly repository: ResourceRepository) {}

  async listResources(
    filters: ResourceFilters,
  ): Promise<PaginatedResponse<Resource>> {
    const { page = 1, limit = 20 } = filters;
    const { records, total } = await this.repository.findAll(filters);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getResourceById(id: string): Promise<Resource> {
    const resource = await this.repository.findById(id);
    if (!resource) throw NotFoundError("Resource", id);
    return resource;
  }

  async createResource(data: CreateResourceDto): Promise<Resource> {
    return this.repository.create(data);
  }

  async updateResource(id: string, data: UpdateResourceDto): Promise<Resource> {
    const existing = await this.repository.findById(id);
    if (!existing) throw NotFoundError("Resource", id);
    return this.repository.update(id, data);
  }

  async deleteResource(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw NotFoundError("Resource", id);
    await this.repository.delete(id);
  }
}

const resourceRepository = new ResourceRepository();
export const resourceService = new ResourceService(resourceRepository);
