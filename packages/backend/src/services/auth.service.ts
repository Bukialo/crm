import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { ConflictError, NotFoundError, AppError } from "../utils/errors";
import { User } from "@prisma/client";

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  firebaseUid: string;
  role?: "ADMIN" | "MANAGER" | "AGENT" | "VIEWER";
  phone?: string;
  timezone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  isActive?: boolean;
}

export class AuthService {
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      // Check if user with email already exists
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUserByEmail) {
        throw new ConflictError("User with this email already exists");
      }

      // Check if user with Firebase UID already exists
      const existingUserByUid = await prisma.user.findUnique({
        where: { firebaseUid: data.firebaseUid },
      });

      if (existingUserByUid) {
        throw new ConflictError("User with this Firebase UID already exists");
      }

      // Prepare base user data with only guaranteed fields
      const baseUserData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        firebaseUid: data.firebaseUid,
        role: data.role || "AGENT",
        isActive: true,
        lastLogin: new Date(),
      };

      // Try to create user with all fields first
      try {
        const fullUserData: any = { ...baseUserData };
        
        if (data.phone) {
          fullUserData.phone = data.phone;
        }
        if (data.timezone) {
          fullUserData.timezone = data.timezone;
        } else {
          fullUserData.timezone = "UTC";
        }

        const user = await prisma.user.create({ data: fullUserData });
        logger.info(`User created successfully with all fields: ${user.email}`);
        return user;
      } catch (error: any) {
        logger.warn('Failed to create user with timezone field, trying without it:', error.message);
        
        // If that fails, try with only essential fields
        try {
          const essentialData: any = { ...baseUserData };
          if (data.phone) {
            essentialData.phone = data.phone;
          }
          
          const user = await prisma.user.create({ data: essentialData });
          logger.info(`User created successfully with essential fields only: ${user.email}`);
          return user;
        } catch (secondError: any) {
          logger.error('Failed to create user even with essential fields:', secondError);
          throw secondError;
        }
      }
    } catch (error) {
      logger.error("Error in createUser:", error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.isActive) {
      throw new AppError("User account is disabled", 403);
    }

    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const existingUser = await this.getUserById(id);

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info(`User updated successfully: ${user.email}`);
      return user;
    } catch (error: any) {
      // If timezone field doesn't exist, try without it
      if ((error.code === 'P2012' || error.message?.includes('timezone')) && data.timezone) {
        logger.warn('Timezone field not found in database, updating user without it');
        const { timezone, ...dataWithoutTimezone } = data;
        const user = await prisma.user.update({
          where: { id },
          data: {
            ...dataWithoutTimezone,
            updatedAt: new Date(),
          },
        });
        logger.info(`User updated successfully without timezone: ${user.email}`);
        return user;
      }
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    logger.info(`User deactivated: ${user.email}`);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);

    // In a production app, you might want to soft delete or transfer data
    // For now, we'll actually delete the user
    await prisma.user.delete({
      where: { id },
    });

    logger.info(`User deleted: ${user.email}`);
  }

  async getAllUsers(
    filters: {
      isActive?: boolean;
      role?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { isActive, role, search, page = 1, pageSize = 20 } = filters;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          // Exclude sensitive fields
        },
      }),
    ]);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Method to check if user exists and create if not (for Firebase integration)
  async findOrCreateUser(firebaseUser: {
    uid: string;
    email: string;
    displayName?: string;
  }): Promise<User> {
    try {
      // Validate required fields
      if (!firebaseUser.uid) {
        logger.error("Missing Firebase UID in findOrCreateUser");
        throw new AppError("Missing Firebase user ID", 400);
      }
      
      if (!firebaseUser.email) {
        logger.error("Missing email in findOrCreateUser");
        throw new AppError("Missing user email", 400);
      }

      logger.info(`Finding or creating user for Firebase UID: ${firebaseUser.uid}, Email: ${firebaseUser.email}`);

      // Try to find existing user by Firebase UID first
      let user = await this.getUserByFirebaseUid(firebaseUser.uid);

      if (user) {
        logger.info(`Found existing user: ${user.email} (ID: ${user.id})`);
        
        if (!user.isActive) {
          logger.warn(`User account is disabled: ${user.email}`);
          throw new AppError("User account is disabled", 403);
        }
        
        // Update last login
        try {
          await this.updateLastLogin(user.id);
          logger.info(`Updated last login for user: ${user.email}`);
        } catch (updateError) {
          logger.warn(`Failed to update last login for user ${user.email}:`, updateError);
          // Don't fail authentication if we can't update last login
        }
        
        return user;
      }

      // User doesn't exist, create new one
      logger.info(`Creating new user for: ${firebaseUser.email}`);
      
      // Extract first and last name from displayName
      const names = firebaseUser.displayName?.trim()?.split(/\s+/) || [];
      const firstName = names[0] || firebaseUser.email.split("@")[0] || "User";
      const lastName = names.slice(1).join(" ") || "";

      logger.info(`Extracted names - First: "${firstName}", Last: "${lastName}"`);

      user = await this.createUser({
        email: firebaseUser.email,
        firstName,
        lastName,
        firebaseUid: firebaseUser.uid,
        role: "AGENT", // Default role
      });

      logger.info(`Successfully created new user: ${user.email} (ID: ${user.id})`);
      return user;

    } catch (error: any) {
      logger.error("Error in findOrCreateUser:", {
        firebaseUid: firebaseUser?.uid,
        email: firebaseUser?.email,
        error: error.message,
        stack: error.stack
      });
      
      // If it's already an AppError, preserve it
      if (error instanceof AppError) {
        throw error;
      }
      
      // For database errors, provide more specific messages
      if (error.code === 'P2002') {
        logger.error("Unique constraint violation in user creation");
        throw new AppError("A user with this email or Firebase ID already exists", 409);
      }
      
      if (error.code === 'P2025') {
        logger.error("Database record not found");
        throw new AppError("User not found", 404);
      }
      
      // For any other error, wrap it
      throw new AppError("Error processing user authentication", 500);
    }
  }
}
