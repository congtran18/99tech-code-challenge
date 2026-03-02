import { Router } from "express";
import { resourceController } from "../controllers/resource.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createResourceSchema,
  updateResourceSchema,
  listResourcesSchema,
  resourceIdSchema,
} from "../validators/resource.validator";

const router = Router();

router.post("/", validate(createResourceSchema), resourceController.create);
router.get(
  "/",
  validate(listResourcesSchema, "query"),
  resourceController.list,
);
router.get(
  "/:id",
  validate(resourceIdSchema, "params"),
  resourceController.getById,
);
router.put(
  "/:id",
  validate(resourceIdSchema, "params"),
  validate(updateResourceSchema),
  resourceController.update,
);
router.delete(
  "/:id",
  validate(resourceIdSchema, "params"),
  resourceController.delete,
);

export default router;
