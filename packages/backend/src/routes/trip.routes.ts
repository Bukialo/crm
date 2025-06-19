// Crear: packages/backend/src/routes/trip.routes.ts
import { Router } from "express";
import { tripController } from "../controllers/trip.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", tripController.findAll);
router.post("/", tripController.create);
router.get("/:id", tripController.findById);
router.put("/:id", tripController.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), tripController.delete);

export default router;
