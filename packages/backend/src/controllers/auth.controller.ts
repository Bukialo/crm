import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Register new user
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, firstName, lastName, firebaseUid, role } = req.body;

    const user = await this.authService.createUser({
      email,
      firstName,
      lastName,
      firebaseUid,
      role: role || "AGENT",
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
      message: "User registered successfully",
    };

    res.status(201).json(response);
  });

  // Get current user
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getUserById(req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firebaseUid: user.firebaseUid,
        phone: user.phone,
        timezone: user.timezone,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    };

    res.json(response);
  });

  // Update user profile
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, phone, timezone } = req.body;

    const user = await this.authService.updateUser(req.user!.id, {
      firstName,
      lastName,
      phone,
      timezone,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        timezone: user.timezone,
      },
      message: "Profile updated successfully",
    };

    res.json(response);
  });

  // Verify token (for middleware)
  verifyToken = asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      const response: ApiResponse = {
        success: true,
        data: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          firebaseUid: req.user.firebaseUid,
        },
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: "No valid token provided",
      };
      res.status(401).json(response);
    }
  });

  // Logout (invalidate sessions if needed)
  logout = asyncHandler(async (req: Request, res: Response) => {
    // Here you could invalidate refresh tokens, add to blacklist, etc.
    // For now, we'll just return success since JWT tokens are stateless

    const response: ApiResponse = {
      success: true,
      message: "Logged out successfully",
    };

    res.json(response);
  });

  // Delete account
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.deleteUser(req.user!.id);

    const response: ApiResponse = {
      success: true,
      message: "Account deleted successfully",
    };

    res.json(response);
  });
}

export const authController = new AuthController();
