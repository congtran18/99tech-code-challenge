import { Request, Response, NextFunction } from "express";
import { resourceService } from "../services/resource.service";
import { sendSuccess } from "../utils/response.helper";
import logger from "../utils/logger";
import {
  CreateResourceInput,
  UpdateResourceInput,
  ListResourcesInput,
} from "../validators/resource.validator";

export class ResourceController {
  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters = req.query as unknown as ListResourcesInput;
      logger.info({ requestId: req.requestId, filters }, "Listing resources");
      const result = await resourceService.listResources(filters);
      sendSuccess(res, result, "Resources retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = String(req.params["id"]);
      logger.info(
        { requestId: req.requestId, resourceId: id },
        "Fetching resource by ID",
      );
      const resource = await resourceService.getResourceById(id);
      sendSuccess(res, resource, "Resource retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = req.body as CreateResourceInput;
      logger.info(
        { requestId: req.requestId, name: dto.name },
        "Creating new resource",
      );
      const resource = await resourceService.createResource(dto);
      sendSuccess(res, resource, "Resource created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = String(req.params["id"]);
      const dto = req.body as UpdateResourceInput;
      logger.info(
        { requestId: req.requestId, resourceId: id },
        "Updating resource",
      );
      const resource = await resourceService.updateResource(id, dto);
      sendSuccess(res, resource, "Resource updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = String(req.params["id"]);
      logger.info(
        { requestId: req.requestId, resourceId: id },
        "Deleting resource",
      );
      await resourceService.deleteResource(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const resourceController = new ResourceController();
