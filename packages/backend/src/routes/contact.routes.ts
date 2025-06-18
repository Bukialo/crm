import { Router } from "express";
import { contactController } from "../controllers/contact.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createContactSchema,
  updateContactSchema,
  getContactSchema,
  listContactsSchema,
  bulkImportContactsSchema,
  addContactNoteSchema,
  updateContactStatusSchema,
  exportContactsSchema,
} from "../schemas/contact.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export contacts (before /:id routes)
router.get(
  "/export",
  validateQuery(exportContactsSchema.shape.query),
  contactController.export
);

// List contacts
router.get(
  "/",
  validateQuery(listContactsSchema.shape.query),
  contactController.findAll
);

// Create contact
router.post(
  "/",
  validateBody(createContactSchema.shape.body),
  contactController.create
);

// Bulk import contacts
router.post(
  "/bulk-import",
  authorize("ADMIN", "MANAGER"),
  validateBody(bulkImportContactsSchema.shape.body),
  contactController.bulkImport
);

// Get contact by ID
router.get(
  "/:id",
  validateParams(getContactSchema.shape.params),
  contactController.findById
);

// Update contact
router.put(
  "/:id",
  validateParams(updateContactSchema.shape.params),
  validateBody(updateContactSchema.shape.body),
  contactController.update
);

// Update contact status
router.patch(
  "/:id/status",
  validateParams(updateContactStatusSchema.shape.params),
  validateBody(updateContactStatusSchema.shape.body),
  contactController.updateStatus
);

// Delete contact
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getContactSchema.shape.params),
  contactController.delete
);

// Add note to contact
router.post(
  "/:id/notes",
  validateParams(addContactNoteSchema.shape.params),
  validateBody(addContactNoteSchema.shape.body),
  contactController.addNote
);

export default router;
