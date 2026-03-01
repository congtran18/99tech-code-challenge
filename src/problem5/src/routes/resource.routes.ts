import { Router } from "express";
import { resourceController } from "../controllers/resource.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createResourceSchema,
  updateResourceSchema,
  listResourcesSchema,
} from "../validators/resource.validator";

const router = Router();

router.post("/", validate(createResourceSchema), resourceController.create);
router.get(
  "/",
  validate(listResourcesSchema, "query"),
  resourceController.list,
);
router.get("/:id", resourceController.getById);
router.put("/:id", validate(updateResourceSchema), resourceController.update);
router.delete("/:id", resourceController.delete);

export default router;
