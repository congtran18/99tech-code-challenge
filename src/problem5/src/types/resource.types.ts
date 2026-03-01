export type ResourceStatus = "active" | "inactive" | "archived";

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceDto {
  name: string;
  description?: string;
  status?: ResourceStatus;
}

export interface UpdateResourceDto {
  name?: string;
  description?: string | null;
  status?: ResourceStatus;
}

export interface ResourceFilters {
  status?: ResourceStatus;
  name?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApiResponse<T> =
  | { status: "success"; data: T; message: string }
  | { status: "error"; message: string; errors?: Record<string, string[]> };
