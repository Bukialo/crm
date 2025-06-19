import { Request, Response } from "express";
import { emailService } from "../services/email.service"; // CORREGIDO: usar la instancia exportada
import { asyncHandler } from "../middlewares/error.middleware";
import { z } from "zod";

// Schemas de validación
const createTemplateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.enum([
    "WELCOME",
    "QUOTE",
    "FOLLOW_UP",
    "SEASONAL",
    "POST_TRIP",
    "CUSTOM",
  ]),
  subject: z.string().min(1, "El asunto es requerido"),
  htmlContent: z.string().min(1, "El contenido HTML es requerido"),
  textContent: z.string().optional(),
  variables: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["text", "number", "date", "boolean"]),
      required: z.boolean().optional(),
      defaultValue: z.any().optional(),
      description: z.string().optional(),
    })
  ),
  aiPersonalization: z
    .object({
      enabled: z.boolean(),
      context: z.string().optional(),
      tone: z
        .enum(["PROFESSIONAL", "FRIENDLY", "URGENT", "EXCITING"])
        .optional(),
    })
    .optional(),
});

const sendEmailSchema = z.object({
  to: z.array(z.string().email()),
  templateId: z.string().optional(),
  subject: z.string().min(1, "El asunto es requerido"),
  htmlContent: z.string().min(1, "El contenido es requerido"),
  textContent: z.string().optional(),
  variables: z.record(z.any()).optional(),
  scheduledAt: z.coerce.date().optional(),
  trackOpens: z.boolean().optional().default(true),
  trackClicks: z.boolean().optional().default(true),
});

const sendCampaignSchema = z.object({
  name: z.string().min(1, "El nombre de la campaña es requerido"),
  templateId: z.string(),
  targetCriteria: z.object({
    status: z.array(z.enum(["INTERESADO", "PASAJERO", "CLIENTE"])).optional(),
    tags: z.array(z.string()).optional(),
    destinations: z.array(z.string()).optional(),
    budgetRange: z
      .array(z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"]))
      .optional(),
    lastTripDays: z.number().optional(),
  }),
  scheduledDate: z.coerce.date().optional(),
  useAiPersonalization: z.boolean().optional().default(false),
});

export class EmailController {
  // CORREGIDO: No necesitamos instanciar el servicio, usamos la instancia exportada

  // Gestión de Templates
  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;
    const templates = await emailService.getTemplates(category as string);

    res.json({
      success: true,
      data: templates,
    });
  });

  getTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await emailService.getTemplate(id);

    res.json({
      success: true,
      data: template,
    });
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTemplateSchema.parse(req.body);
    const template = await emailService.createTemplate(
      validatedData,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      data: template,
      message: "Template creado exitosamente",
    });
  });

  updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = createTemplateSchema.partial().parse(req.body);
    const template = await emailService.updateTemplate(id, validatedData);

    res.json({
      success: true,
      data: template,
      message: "Template actualizado exitosamente",
    });
  });

  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await emailService.deleteTemplate(id);

    res.json({
      success: true,
      message: "Template eliminado exitosamente",
    });
  });

  duplicateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await emailService.duplicateTemplate(id, req.user!.id);

    res.status(201).json({
      success: true,
      data: template,
      message: "Template duplicado exitosamente",
    });
  });

  // Envío de Emails
  sendEmail = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = sendEmailSchema.parse(req.body);
    const result = await emailService.sendEmail(validatedData, req.user!.id);

    res.json({
      success: true,
      data: result,
      message: "Email enviado exitosamente",
    });
  });

  sendTestEmail = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = sendEmailSchema.parse(req.body);
    const result = await emailService.sendTestEmail(
      { ...validatedData, to: [req.user!.email] },
      req.user!.id
    );

    res.json({
      success: true,
      data: result,
      message: "Email de prueba enviado",
    });
  });

  // Campañas
  sendCampaign = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = sendCampaignSchema.parse(req.body);
    const campaign = await emailService.sendCampaign(
      validatedData,
      req.user!.id
    );

    res.json({
      success: true,
      data: campaign,
      message: "Campaña programada exitosamente",
    });
  });

  getCampaigns = asyncHandler(async (req: Request, res: Response) => {
    const campaigns = await emailService.getCampaigns();

    res.json({
      success: true,
      data: campaigns,
    });
  });

  getCampaignStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await emailService.getCampaignStats(id);

    res.json({
      success: true,
      data: stats,
    });
  });

  // Historial
  getEmailHistory = asyncHandler(async (req: Request, res: Response) => {
    const {
      contactId,
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 20,
    } = req.query;

    const result = await emailService.getEmailHistory({
      contactId: contactId as string,
      status: status as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
    });

    res.json({
      success: true,
      data: result,
    });
  });

  // Preview
  previewTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { variables } = req.body;
    const preview = await emailService.previewTemplate(id, variables || {});

    res.json({
      success: true,
      data: preview,
    });
  });

  // Métricas
  getEmailStats = asyncHandler(async (req: Request, res: Response) => {
    const { period = "month" } = req.query;
    const stats = await emailService.getEmailStats(period as string);

    res.json({
      success: true,
      data: stats,
    });
  });

  // Tracking
  trackEmailOpen = asyncHandler(async (req: Request, res: Response) => {
    const { trackingId } = req.params;
    await emailService.trackEmailOpen(trackingId);

    // Responder con imagen 1x1 pixel transparente
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": pixel.length,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.end(pixel);
  });

  trackEmailClick = asyncHandler(async (req: Request, res: Response) => {
    const { trackingId } = req.params;
    const { url } = req.query;

    await emailService.trackEmailClick(trackingId, url as string);

    // Redirigir a la URL original
    res.redirect(decodeURIComponent(url as string));
  });
}

// CORREGIDO: Exportar instancia directamente
export const emailController = new EmailController();
