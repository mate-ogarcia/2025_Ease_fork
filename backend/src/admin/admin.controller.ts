/**
 * @file admin.controller.ts
 * @brief Controller for administrative operations
 * @details This controller handles administrative operations such as user management.
 * It has been modified to improve error handling and provide better logging.
 * Authentication guards have been enabled to secure administrative routes.
 *
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 */

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsersService } from "../users/users.service";
import { UserRole } from "src/auth/enums/roles.enum";
/**
 * @brief Controller for administrative operations.
 * @details This controller is protected by JwtAuthGuard and RolesGuard,
 * ensuring that only authenticated users with the Admin role can access these endpoints.
 */
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  /**
   * @brief Constructor for AdminController.
   * @param {AuthService} authService - Service for handling authentication operations.
   * @param {UsersService} usersService - Service for handling user operations.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  /**
   * @brief Creates the initial admin user for the application.
   * @details This endpoint initializes the first administrator account with the provided credentials.
   *
   * @param {Object} createAdminDto - Object containing email and password for the admin.
   * @returns {Promise<Object>} Response with the created admin details.
   * @throws {HttpException} If there is an error during admin initialization.
   */
  @Post("initialize")
  async initializeAdmin(
    @Body() createAdminDto: { email: string; password: string },
  ) {
    try {
      const username = createAdminDto.email.split("@")[0];
      const admin = await this.authService.register(
        username,
        createAdminDto.email,
        createAdminDto.password,
        UserRole.ADMIN,
      );

      console.log("👑 Admin initialized with role:", UserRole.ADMIN);

      return {
        message: "Administrator initialized successfully",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error) {
      console.error(
        "❌ Error during administrator initialization:",
        error,
      );
      throw new HttpException(
        "Error during administrator initialization",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @brief Retrieves all users from the database.
   * @details This endpoint fetches all registered users from the database.
   *
   * @returns {Promise<Array>} Array of user objects or empty array on error.
   */
  @Get("users")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Req() request: any): Promise<any[]> {
    try {
      console.log(`🔍 Admin Controller - getAllUsers - Path: ${request.path}`);
      console.log(`🔍 Admin Controller - getAllUsers - Method: ${request.method}`);
      console.log(`👤 Admin Controller - Request user:`, request.user ? {
        id: request.user.id,
        email: request.user.email,
        role: request.user.role
      } : "No user found");

      // Vérifier si l'utilisateur est authentifié et a le rôle Admin
      if (!request.user || request.user.role !== UserRole.ADMIN) {
        console.error(`❌ Admin Controller - Unauthorized access attempt to getAllUsers by:`, request.user || "Unknown user");
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: "Insufficient permissions to access user data",
          },
          HttpStatus.FORBIDDEN
        );
      }

      console.log(`🔍 Admin Controller - Calling usersService.findAll()`);
      const users = await this.usersService.findAll();

      if (!users || users.length === 0) {
        console.warn("⚠️ Admin Controller - No users found");
        return [];
      }

      console.log(`✅ Admin Controller - Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      console.error(`❌ Admin Controller - Error in getAllUsers: ${error.message}`);
      console.error(`❌ Admin Controller - Error stack: ${error.stack}`);

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to retrieve users: ${error.message}`,
          stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @brief Updates a user's role.
   * @details This endpoint changes the role of a specified user.
   *
   * @param {string} id - The ID of the user to update.
   * @param {UserRole} role - The new role to assign.
   * @returns {Promise<Object>} The updated user object.
   * @throws {HttpException} If there is an error during role update.
   */
  @Patch("users/:id/role")
  async updateUserRole(@Param("id") id: string, @Body("role") role: UserRole) {
    try {
      return await this.usersService.updateRole(id, role);
    } catch (error) {
      console.error("❌ Error updating user role:", error);
      throw new HttpException(
        "Error updating user role",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @brief Deletes a user from the database.
   * @details This endpoint removes a specified user from the database.
   *
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<Object>} Success message.
   * @throws {HttpException} If there is an error during user deletion.
   */
  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    try {
      return await this.usersService.delete(id);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw new HttpException(
        "Error deleting user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
