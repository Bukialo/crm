import { Request, Response } from "express";
import { TripService } from "../services/trip.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

const tripService = new TripService();

export class TripController {
  // Create trip
  create = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.create(req.body, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: trip,
      message: "Trip created successfully",
    };

    res.status(201).json(response);
  });

  // Get all trips with filters
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await tripService.findAll({
      ...req.query,
      status: req.query.status
        ? Array.isArray(req.query.status)
          ? req.query.status
          : [req.query.status]
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

  // Get trip by ID
  findById = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.findById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: trip,
    };

    res.json(response);
  });

  // Update trip
  update = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.update(
      req.params.id,
      req.body,
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: trip,
      message: "Trip updated successfully",
    };

    res.json(response);
  });

  // Delete trip
  delete = asyncHandler(async (req: Request, res: Response) => {
    await tripService.delete(req.params.id, req.user!.id);

    const response: ApiResponse = {
      success: true,
      message: "Trip deleted successfully",
    };

    res.json(response);
  });

  // Update trip status
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const trip = await tripService.updateStatus(
      req.params.id,
      status,
      req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: trip,
      message: "Trip status updated successfully",
    };

    res.json(response);
  });

  // Get trip statistics
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await tripService.getStats(req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  });
}

export const tripController = new TripController();
