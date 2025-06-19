import { Router } from "express";
import { campaignController } from "../controllers/campaign.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createCampaignSchema,
  updateCampaignSchema,
  getCampaignSchema,
  listCampaignsSchema,
  sendCampaignSchema,
  previewCampaignSchema,
  testSendSchema,
  scheduleCampaignSchema,
  updateCampaignStatusSchema,
} from "../schemas/campaign.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List campaigns
router.get(
  "/",
  validateQuery(listCampaignsSchema.shape.query),
  campaignController.findAll
);

// Create campaign
router.post(
  "/",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateBody(createCampaignSchema.shape.body),
  campaignController.create
);

// Get campaign by ID
router.get(
  "/:id",
  validateParams(getCampaignSchema.shape.params),
  campaignController.findById
);

// Update campaign
router.put(
  "/:id",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(updateCampaignSchema.shape.params),
  validateBody(updateCampaignSchema.shape.body),
  campaignController.update
);

// Delete campaign
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getCampaignSchema.shape.params),
  campaignController.delete
);

// Send campaign
router.post(
  "/:id/send",
  authorize("ADMIN", "MANAGER"),
  validateParams(sendCampaignSchema.shape.params),
  campaignController.send
);

// Duplicate campaign
router.post(
  "/:id/duplicate",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(getCampaignSchema.shape.params),
  campaignController.duplicate
);

// Get campaign statistics
router.get(
  "/:id/stats",
  validateParams(getCampaignSchema.shape.params),
  campaignController.getStats
);

// Get campaign analytics
router.get(
  "/:id/analytics",
  validateParams(getCampaignSchema.shape.params),
  campaignController.getAnalytics
);

// Preview campaign
router.post(
  "/:id/preview",
  validateParams(previewCampaignSchema.shape.params),
  validateBody(previewCampaignSchema.shape.body),
  campaignController.preview
);

// Test send campaign
router.post(
  "/:id/test-send",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(getCampaignSchema.shape.params),
  validateBody(testSendSchema.shape.body),
  campaignController.testSend
);

// Schedule campaign
router.post(
  "/:id/schedule",
  authorize("ADMIN", "MANAGER"),
  validateParams(scheduleCampaignSchema.shape.params),
  validateBody(scheduleCampaignSchema.shape.body),
  campaignController.schedule
);

// Update campaign status (pause, resume, cancel)
router.patch(
  "/:id/status",
  authorize("ADMIN", "MANAGER"),
  validateParams(updateCampaignStatusSchema.shape.params),
  validateBody(updateCampaignStatusSchema.shape.body),
  campaignController.updateStatus
);

// Get campaign recipients
router.get(
  "/:id/recipients",
  validateParams(getCampaignSchema.shape.params),
  campaignController.getRecipients
);

export default router;
