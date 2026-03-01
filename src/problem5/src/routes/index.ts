import { Router } from "express";
import resourceRoutes from "./resource.routes";

const router = Router();

router.use("/resources", resourceRoutes);

export default router;
