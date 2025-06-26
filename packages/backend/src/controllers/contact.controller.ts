import { Request, Response } from "express";
import { ContactService } from "../services/contact.service";
import { asyncHandler } from "../middlewares/error.middleware";
import Papa from "papaparse";
import ExcelJS from "exceljs";

// CORREGIDO: Importar tipos desde archivo local
import { ApiResponse } from "../types/shared";

const contactService = new ContactService();

export class ContactController {
  // Create a new contact
  create = asyncHandler(async (req: Request, res: Response) => {
    const contact = await contactService.create(req.body, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: contact,
      message: "Contact created successfully",
    };

    res.status(201).json(response);
  });

  // Get all contacts with filters
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.findAll({
      ...req.query,
      status: req.query.status
        ? Array.isArray(req.query.status)
          ? req.query.status
          : [req.query.status]
        : undefined,
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? req.query.tags
          : [req.query.tags]
        : undefined,
    } as any);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  });

  // Get contact by ID
  findById = asyncHandler(async (req: Request, res: Response) => {
    try {
      const contact = await contactService.findById(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: contact,
      };

      res.json(response);
    } catch (error: any) {
      // CORREGIDO: Mejor manejo de errores
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: "Contact not found",
          message: "The requested contact does not exist",
        });
      }

      console.error("Error in findById:", error);
      res.status(500).json({
        success: false,
        error: "Error retrieving contact",
        message: error.message,
      });
    }
  });

  // Update contact
  update = asyncHandler(async (req: Request, res: Response) => {
    try {
      const contact = await contactService.update(
        req.params.id,
        req.body,
        req.user!.id
      );

      const response: ApiResponse = {
        success: true,
        data: contact,
        message: "Contact updated successfully",
      };

      res.json(response);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: "Contact not found",
        });
      }

      if (error.message?.includes("already exists")) {
        return res.status(409).json({
          success: false,
          error: "Email already in use",
        });
      }

      throw error;
    }
  });

  // Update contact status
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, reason } = req.body;

    try {
      const contact = await contactService.updateStatus(
        req.params.id,
        status,
        req.user!.id,
        reason
      );

      const response: ApiResponse = {
        success: true,
        data: contact,
        message: "Contact status updated successfully",
      };

      res.json(response);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: "Contact not found",
        });
      }

      throw error;
    }
  });

  // Delete contact
  delete = asyncHandler(async (req: Request, res: Response) => {
    try {
      await contactService.delete(req.params.id, req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: "Contact deleted successfully",
      };

      res.json(response);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: "Contact not found",
        });
      }

      throw error;
    }
  });

  // Add note to contact
  addNote = asyncHandler(async (req: Request, res: Response) => {
    const { content, isImportant } = req.body;

    try {
      await contactService.addNote(
        req.params.id,
        content,
        req.user!.id,
        isImportant
      );

      const response: ApiResponse = {
        success: true,
        message: "Note added successfully",
      };

      res.status(201).json(response);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: "Contact not found",
        });
      }

      throw error;
    }
  });

  // Bulk import contacts
  bulkImport = asyncHandler(async (req: Request, res: Response) => {
    const { contacts, skipDuplicates } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid contacts data",
        message: "Contacts must be a non-empty array",
      });
    }

    try {
      const result = await contactService.bulkImport(
        contacts,
        req.user!.id,
        skipDuplicates
      );

      const response: ApiResponse = {
        success: true,
        data: result,
        message: `Import completed: ${result.success} success, ${result.failed} failed`,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Bulk import error:", error);
      res.status(500).json({
        success: false,
        error: "Bulk import failed",
        message: error.message,
      });
    }
  });

  // Export contacts
  export = asyncHandler(async (req: Request, res: Response) => {
    const { format = "csv", fields, ...filterParams } = req.query;

    try {
      // Get all contacts with filters (no pagination for export)
      const result = await contactService.findAll({
        ...filterParams,
        page: 1,
        pageSize: 10000, // Large number to get all records
      } as any);

      const contacts = result.items;

      if (format === "csv") {
        // CORREGIDO: Generar CSV con mejor manejo de datos
        const csvData = contacts.map((contact) => ({
          "First Name": contact.firstName || "",
          "Last Name": contact.lastName || "",
          Email: contact.email || "",
          Phone: contact.phone || "",
          Status: contact.status || "",
          Tags: Array.isArray(contact.tags) ? contact.tags.join(", ") : "",
          "Assigned Agent": contact.assignedAgent
            ? `${contact.assignedAgent.firstName} ${contact.assignedAgent.lastName}`
            : "",
          "Trips Count": contact.trips ? contact.trips.length : 0,
          "Last Activity": contact.lastActivity
            ? new Date(contact.lastActivity).toLocaleDateString()
            : "",
        }));

        const csv = Papa.unparse(csvData);

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=contacts.csv"
        );
        res.send(csv);
      } else if (format === "xlsx") {
        // CORREGIDO: Generar Excel con mejor estructura
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Contacts");

        // Add headers
        worksheet.columns = [
          { header: "First Name", key: "firstName", width: 15 },
          { header: "Last Name", key: "lastName", width: 15 },
          { header: "Email", key: "email", width: 25 },
          { header: "Phone", key: "phone", width: 15 },
          { header: "Status", key: "status", width: 12 },
          { header: "Tags", key: "tags", width: 20 },
          { header: "Assigned Agent", key: "assignedAgent", width: 20 },
          { header: "Trips Count", key: "tripsCount", width: 12 },
          { header: "Last Activity", key: "lastActivity", width: 15 },
        ];

        // Add data
        contacts.forEach((contact) => {
          worksheet.addRow({
            firstName: contact.firstName || "",
            lastName: contact.lastName || "",
            email: contact.email || "",
            phone: contact.phone || "",
            status: contact.status || "",
            tags: Array.isArray(contact.tags) ? contact.tags.join(", ") : "",
            assignedAgent: contact.assignedAgent
              ? `${contact.assignedAgent.firstName} ${contact.assignedAgent.lastName}`
              : "",
            tripsCount: contact.trips ? contact.trips.length : 0,
            lastActivity: contact.lastActivity
              ? new Date(contact.lastActivity).toLocaleDateString()
              : "",
          });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=contacts.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
      } else {
        res.status(400).json({
          success: false,
          error: "Invalid format",
          message: "Supported formats: csv, xlsx",
        });
      }
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        error: "Export failed",
        message: error.message,
      });
    }
  });

  // CORREGIDO: Método adicional para obtener estadísticas de contactos
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    // Agregado underscore para req no usado
    try {
      // Mock stats - implementar lógica real según necesidades
      const stats = {
        total: 0,
        byStatus: {
          INTERESADO: 0,
          PASAJERO: 0,
          CLIENTE: 0,
        },
        bySource: {},
        growthRate: 0,
        recentlyAdded: 0,
      };

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Error getting contact stats:", error);
      res.status(500).json({
        success: false,
        error: "Error getting contact statistics",
        message: error.message,
      });
    }
  });
}

export const contactController = new ContactController();
