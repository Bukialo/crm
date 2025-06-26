import { Router } from "express";
import { contactController } from "../controllers/contact.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  // validateParams removido porque no se usa
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

// CORREGIDO: Importar esquemas desde el archivo local y exportar los enums faltantes
import {
  createContactSchema,
  updateContactSchema,
  // getContactSchema removido porque no se usa
  listContactsSchema,
  bulkImportContactsSchema,
  addContactNoteSchema,
  updateContactStatusSchema,
  exportContactsSchema,
} from "../schemas/contact.schema";

// CORREGIDO: Exportar enums desde contact.schema.ts
export enum ContactStatus {
  INTERESADO = "INTERESADO",
  PASAJERO = "PASAJERO",
  CLIENTE = "CLIENTE",
}

export enum BudgetRange {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  LUXURY = "LUXURY",
}

export enum TravelStyle {
  ADVENTURE = "ADVENTURE",
  RELAXATION = "RELAXATION",
  CULTURAL = "CULTURAL",
  BUSINESS = "BUSINESS",
  LUXURY = "LUXURY",
  FAMILY = "FAMILY",
  ROMANTIC = "ROMANTIC",
}

export enum ContactSource {
  WEBSITE = "WEBSITE",
  REFERRAL = "REFERRAL",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  ADVERTISING = "ADVERTISING",
  DIRECT = "DIRECT",
  PARTNER = "PARTNER",
  OTHER = "OTHER",
}

const router = Router();

// CORREGIDO: Validación UUID más flexible - removido flexibleIdSchema no usado

// Helper function para validación manual más flexible
const validateContactId = (req: any, res: any, next: any) => {
  const { id } = req.params;
  if (!id || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Contact ID is required",
    });
  }
  next();
};

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

// CORREGIDO: Usar validación manual más flexible para parámetros de ID
router.get("/:id", validateContactId, contactController.findById);

// Update contact
router.put(
  "/:id",
  validateContactId,
  validateBody(updateContactSchema.shape.body),
  contactController.update
);

// Update contact status
router.patch(
  "/:id/status",
  validateContactId,
  validateBody(updateContactStatusSchema.shape.body),
  contactController.updateStatus
);

// Delete contact
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateContactId,
  contactController.delete
);

// Add note to contact
router.post(
  "/:id/notes",
  validateContactId,
  validateBody(addContactNoteSchema.shape.body),
  contactController.addNote
);

// CORREGIDO: Rutas adicionales con validación mejorada

// Get contact statistics
router.get("/:id/stats", validateContactId, async (_req, res) => {
  // Agregado underscore para req no usado
  try {
    // Mock stats - implementar lógica real según necesidades
    const stats = {
      totalTrips: 0,
      totalSpent: 0,
      lastTripDate: null,
      averageRating: 0,
      preferredDestinations: [],
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Error getting contact stats",
      message: error.message,
    });
  }
});

// Get contact activity history
router.get("/:id/activity", validateContactId, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Mock activity - implementar lógica real
    const activities: any[] = []; // Explicitly typed as any[]

    res.json({
      success: true,
      data: {
        items: activities,
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Error getting contact activity",
      message: error.message,
    });
  }
});

// Get contact notes
router.get("/:id/notes", validateContactId, async (_req, res) => {
  // Agregado underscore para req no usado
  try {
    // Mock notes - implementar lógica real
    const notes: any[] = []; // Explicitly typed as any[]

    res.json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Error getting contact notes",
      message: error.message,
    });
  }
});

// Endpoint para obtener opciones de filtrado
router.get("/filters/options", async (_req, res) => {
  // Agregado underscore para req no usado
  try {
    const options = {
      status: Object.values(ContactStatus).map((status: string) => ({
        value: status,
        label: status.charAt(0) + status.slice(1).toLowerCase(),
      })),
      budgetRange: Object.values(BudgetRange).map((range: string) => ({
        value: range,
        label: range.charAt(0) + range.slice(1).toLowerCase(),
      })),
      travelStyle: Object.values(TravelStyle).map((style: string) => ({
        value: style,
        label: style.charAt(0) + style.slice(1).toLowerCase(),
      })),
      source: Object.values(ContactSource).map((source: string) => ({
        value: source,
        label: source
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (l: string) => l.toUpperCase()), // Added type for l parameter
      })),
    };

    res.json({
      success: true,
      data: options,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Error getting filter options",
      message: error.message,
    });
  }
});

// Endpoint para validar email disponibilidad
router.post(
  "/validate/email",
  validateBody(
    z.object({
      email: z.string().email("Invalid email format"),
      // excludeId removido porque no se usa
    })
  ),
  async (req, res) => {
    try {
      const { email } = req.body; // Removido excludeId no usado

      // Implementar validación real con Prisma
      // const exists = await prisma.contact.findUnique({
      //   where: { email },
      // });

      // Mock response
      const available = true; // !exists || exists.id === excludeId;

      res.json({
        success: true,
        data: {
          email,
          available,
          message: available ? "Email is available" : "Email is already in use",
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Error validating email",
        message: error.message,
      });
    }
  }
);

// Error handler middleware para esta ruta específica - removido next no usado
router.use((error: any, _req: any, res: any, _next: any) => {
  console.error("Contact routes error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: error.errors,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error in contact routes",
    message: error.message,
  });
});

export default router;
