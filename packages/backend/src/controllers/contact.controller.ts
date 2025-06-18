import { Request, Response } from "express";
import { ContactService } from "../services/contact.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";
import Papa from "papaparse";
import ExcelJS from "exceljs";

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
    const contact = await contactService.findById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: contact,
    };

    res.json(response);
  });

  // Update contact
  update = asyncHandler(async (req: Request, res: Response) => {
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
  });

  // Update contact status
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, reason } = req.body;
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
  });

  // Delete contact
  delete = asyncHandler(async (req: Request, res: Response) => {
    await contactService.delete(req.params.id, req.user!.id);

    const response: ApiResponse = {
      success: true,
      message: "Contact deleted successfully",
    };

    res.json(response);
  });

  // Add note to contact
  addNote = asyncHandler(async (req: Request, res: Response) => {
    const { content, isImportant } = req.body;
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
  });

  // Bulk import contacts
  bulkImport = asyncHandler(async (req: Request, res: Response) => {
    const { contacts, skipDuplicates } = req.body;
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
  });

  // Export contacts
  export = asyncHandler(async (req: Request, res: Response) => {
    const { format = "csv", fields, ...filterParams } = req.query;

    // Get all contacts with filters (no pagination for export)
    const result = await contactService.findAll({
      ...filterParams,
      page: 1,
      pageSize: 10000, // Large number to get all records
    } as any);

    const contacts = result.items;

    if (format === "csv") {
      // Generate CSV
      const csv = Papa.unparse(
        contacts.map((contact) => ({
          "First Name": contact.firstName,
          "Last Name": contact.lastName,
          Email: contact.email,
          Phone: contact.phone || "",
          Status: contact.status,
          Tags: contact.tags.join(", "),
          "Assigned Agent": contact.assignedAgent
            ? `${contact.assignedAgent.firstName} ${contact.assignedAgent.lastName}`
            : "",
          "Trips Count": contact.trips.length,
        }))
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
      res.send(csv);
    } else if (format === "xlsx") {
      // Generate Excel
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
      ];

      // Add data
      contacts.forEach((contact) => {
        worksheet.addRow({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone || "",
          status: contact.status,
          tags: contact.tags.join(", "),
          assignedAgent: contact.assignedAgent
            ? `${contact.assignedAgent.firstName} ${contact.assignedAgent.lastName}`
            : "",
          tripsCount: contact.trips.length,
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
    }
  });
}

export const contactController = new ContactController();
