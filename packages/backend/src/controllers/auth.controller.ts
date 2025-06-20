import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Register new user - CORREGIDO para manejar usuarios existentes
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, firstName, lastName, firebaseUid, role } = req.body;

    try {
      // Verificar si el usuario ya existe por email o firebaseUid
      const existingUser =
        (await this.authService.getUserByEmail(email)) ||
        (await this.authService.getUserByFirebaseUid(firebaseUid));

      if (existingUser) {
        // Si el usuario ya existe, devolverlo en lugar de crear uno nuevo
        const response: ApiResponse = {
          success: true,
          data: {
            id: existingUser.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            role: existingUser.role,
            firebaseUid: existingUser.firebaseUid,
          },
          message: "User already exists, logged in successfully",
        };

        return res.status(200).json(response);
      }

      // Si no existe, crear nuevo usuario
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
    } catch (error: any) {
      console.error("Error in register:", error);

      // Manejar errores específicos
      if (error.message?.includes("already exists")) {
        // Si hay error de duplicado, intentar buscar y devolver el usuario existente
        try {
          const existingUser = await this.authService.getUserByEmail(email);
          if (existingUser) {
            const response: ApiResponse = {
              success: true,
              data: {
                id: existingUser.id,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                role: existingUser.role,
                firebaseUid: existingUser.firebaseUid,
              },
              message: "User already exists, retrieved successfully",
            };
            return res.status(200).json(response);
          }
        } catch (searchError) {
          console.error("Error searching existing user:", searchError);
        }
      }

      res.status(500).json({
        success: false,
        error: "Registration failed",
        message: error.message,
      });
    }
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

  // Endpoint para login/registro combinado (recomendado para Firebase)
  loginOrRegister = asyncHandler(async (req: Request, res: Response) => {
    const { email, firstName, lastName, firebaseUid, role } = req.body;

    try {
      // Buscar usuario existente
      let user = await this.authService.getUserByFirebaseUid(firebaseUid);

      if (!user) {
        // Si no existe, buscar por email
        user = await this.authService.getUserByEmail(email);
      }

      if (!user) {
        // Si no existe en absoluto, crear nuevo usuario
        user = await this.authService.createUser({
          email,
          firstName: firstName || email.split("@")[0],
          lastName: lastName || "",
          firebaseUid,
          role: role || "AGENT",
        });
      }

      // Actualizar último login
      await this.authService.updateLastLogin(user.id);

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
        },
        message: user ? "Login successful" : "User created and logged in",
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error("Error in loginOrRegister:", error);
      res.status(500).json({
        success: false,
        error: "Authentication failed",
        message: error.message,
      });
    }
  });
}

export const authController = new AuthController();
