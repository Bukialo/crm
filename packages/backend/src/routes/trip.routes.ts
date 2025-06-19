import { Router } from "express";
import { tripController } from "../controllers/trip.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createTripSchema,
  updateTripSchema,
  getTripSchema,
  listTripsSchema,
  updateTripStatusSchema,
} from "../schemas/trip.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List trips
router.get(
  "/",
  validateQuery(listTripsSchema.shape.query),
  tripController.findAll
);

// Create trip
router.post(
  "/",
  validateBody(createTripSchema.shape.body),
  tripController.create
);

// Get trip statistics
router.get("/stats", tripController.getStats);

// Get trip by ID
router.get(
  "/:id",
  validateParams(getTripSchema.shape.params),
  tripController.findById
);

// Update trip
router.put(
  "/:id",
  validateParams(updateTripSchema.shape.params),
  validateBody(updateTripSchema.shape.body),
  tripController.update
);

// Update trip status
router.patch(
  "/:id/status",
  validateParams(updateTripStatusSchema.shape.params),
  validateBody(updateTripStatusSchema.shape.body),
  tripController.updateStatus
);

// Delete trip
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getTripSchema.shape.params),
  tripController.delete
);

export default router;
