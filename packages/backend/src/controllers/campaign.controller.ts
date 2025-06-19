import { Request, Response } from "express";
import { CampaignService } from "../services/campaign.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

export class CampaignController {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  // Create campaign
  create = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await this.campaignService.create(req.body, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: campaign,
      message: "Campaign created successfully",
    };

    res.status(201).json(response);
  });

  // Get all campaigns with filters
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.campaignService.findAll({
      ...req.query,
      status: req.query.status
        ? Array.isArray(req.query.status)
          ? req.query.status
          : [req.query.status]
        : undefined,
      type: req.query.type
        ? Array.isArray(req.query.type)
          ? req.query.type
          : [req.query.type]
        : undefined,
      dateFrom: req.query.dateFrom
        ? new Date(req.query.dateFrom as string)
        : undefined,
      dateTo: req.query.dateTo
        ? new Date(req.query.dateTo as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      pageSize: req.query.pageSize
        ? parseInt(req.query.pageSize as string)
        : undefined,
    } as any);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  });

  // Get campaign by ID
  findById = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await this.campaignService.findById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: campaign,
    };

    res.json(response);
  });

  // Update campaign
  update = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await this.campaignService.update(
      req.params.id,
      req.body,
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: campaign,
      message: "Campaign updated successfully",
    };

    res.json(response);
  });

  // Delete campaign
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.campaignService.delete(req.params.id, req.user!.id);

    const response: ApiResponse = {
      success: true,
      message: "Campaign deleted successfully",
    };

    res.json(response);
  });

  // Send campaign
  send = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.campaignService.sendCampaign(
      req.params.id,
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Campaign sent successfully",
    };

    res.json(response);
  });

  // Duplicate campaign
  duplicate = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await this.campaignService.duplicateCampaign(
      req.params.id,
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: campaign,
      message: "Campaign duplicated successfully",
    };

    res.status(201).json(response);
  });

  // Get campaign statistics
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.campaignService.getStats(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  });

  // Preview campaign (simulate sending without actually sending)
  preview = asyncHandler(async (req: Request, res: Response) => {
    const { recipients } = req.body; // Array of contact IDs for preview

    // Aquí se implementaría la lógica de preview
    // Por ahora devolvemos un mock
    const previewData = {
      subject: "Preview Subject",
      htmlContent: "<h1>Preview Content</h1>",
      textContent: "Preview Content",
      variables: {
        firstName: "John",
        lastName: "Doe",
        // ... other variables
      },
    };

    const response: ApiResponse = {
      success: true,
      data: previewData,
    };

    res.json(response);
  });

  // Test send campaign to specific emails
  testSend = asyncHandler(async (req: Request, res: Response) => {
    const { emails } = req.body; // Array of test emails

    // Aquí se implementaría el envío de prueba
    // Por ahora simulamos
    const result = {
      success: true,
      sentTo: emails,
      sentAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Test emails sent successfully",
    };

    res.json(response);
  });

  // Get campaign recipients with pagination
  getRecipients = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const status = req.query.status as string; // sent, opened, clicked, etc.

    // Aquí se implementaría la consulta de destinatarios
    const recipients = {
      items: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };

    const response: ApiResponse = {
      success: true,
      data: recipients,
    };

    res.json(response);
  });

  // Update campaign status (pause, resume, cancel)
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    // Aquí se implementaría la actualización de estado
    const campaign = await this.campaignService.update(
      req.params.id,
      { status },
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: campaign,
      message: `Campaign ${status.toLowerCase()} successfully`,
    };

    res.json(response);
  });

  // Schedule campaign for later sending
  schedule = asyncHandler(async (req: Request, res: Response) => {
    const { scheduledDate, timezone } = req.body;

    const campaign = await this.campaignService.update(
      req.params.id,
      {
        scheduledDate: new Date(scheduledDate),
        timezone,
        status: "SCHEDULED" as any,
      },
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: campaign,
      message: "Campaign scheduled successfully",
    };

    res.json(response);
  });

  // Get campaign performance analytics
  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.campaignService.getStats(req.params.id);

    // Agregar datos adicionales de analytics
    const analytics = {
      ...stats,
      timeline: [
        // Mock data - en producción vendría de la base de datos
        { date: "2024-01-01", sent: 100, opened: 25, clicked: 5 },
        { date: "2024-01-02", sent: 0, opened: 15, clicked: 3 },
        { date: "2024-01-03", sent: 0, opened: 8, clicked: 2 },
      ],
      deviceStats: {
        desktop: 60,
        mobile: 35,
        tablet: 5,
      },
      locationStats: [
        { country: "Argentina", opens: 45, clicks: 8 },
        { country: "Chile", opens: 20, clicks: 4 },
        { country: "Uruguay", opens: 15, clicks: 2 },
      ],
    };

    const response: ApiResponse = {
      success: true,
      data: analytics,
    };

    res.json(response);
  });
}

export const campaignController = new CampaignController();
