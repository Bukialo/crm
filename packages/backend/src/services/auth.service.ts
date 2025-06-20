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

      // Create new user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          firebaseUid: data.firebaseUid,
          role: data.role || "AGENT",
          phone: data.phone,
          timezone: data.timezone || "UTC",
          isActive: true,
          lastLogin: new Date(),
        },
      });

      logger.info(`User created successfully: ${user.email}`);
      return user;
    } catch (error) {
      logger.error("Error creating user:", error);
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

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    logger.info(`User updated successfully: ${user.email}`);
    return user;
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
    let user = await this.getUserByFirebaseUid(firebaseUser.uid);

    if (!user) {
      // Extract first and last name from displayName
      const names = firebaseUser.displayName?.split(" ") || [];
      const firstName = names[0] || firebaseUser.email.split("@")[0];
      const lastName = names.slice(1).join(" ") || "";

      user = await this.createUser({
        email: firebaseUser.email,
        firstName,
        lastName,
        firebaseUid: firebaseUser.uid,
        role: "AGENT", // Default role
      });
    } else if (!user.isActive) {
      throw new AppError("User account is disabled", 403);
    } else {
      // Update last login
      await this.updateLastLogin(user.id);
    }

    return user;
  }
}
