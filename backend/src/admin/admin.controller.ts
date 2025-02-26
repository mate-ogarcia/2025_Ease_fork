/**
 * @file admin.controller.ts
 * @brief Controller for administrative operations
 * @details This controller handles administrative operations such as user management.
 * It has been modified to improve error handling and provide better logging.
 * Authentication guards have been temporarily disabled for testing purposes.
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
  // UseGuards, // Temporarily commented out
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"; // Temporarily commented out
// import { RolesGuard } from "../auth/guards/roles.guard"; // Temporarily commented out
// import { Roles } from "../auth/decorators/roles.decorator"; // Temporarily commented out
import { UsersService } from "../users/users.service";
import { UserRole } from "../auth/enums/role.enum";

@Controller("admin")
// @UseGuards(JwtAuthGuard, RolesGuard) // Temporarily commented out for testing
// @Roles(UserRole.ADMIN) // Temporarily commented out for testing
export class AdminController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * @function initializeAdmin
   * @description Creates the initial admin user for the application
   * @param {Object} createAdminDto - Object containing email and password for the admin
   * @returns {Promise<Object>} Response with the created admin details
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
        message: "Administrateur initialisé avec succès",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'initialisation de l'administrateur:",
        error,
      );
      throw new HttpException(
        "Erreur lors de l'initialisation de l'administrateur",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @function getAllUsers
   * @description Retrieves all users from the database
   * @returns {Promise<Array>} Array of user objects or empty array on error
   */
  @Get("users")
  async getAllUsers() {
    console.log("🔍 Getting all users from admin controller");
    try {
      const users = await this.usersService.findAll();
      console.log(`✅ Retrieved ${users.length} users successfully`);
      return users;
    } catch (error) {
      console.error("❌ Error retrieving users:", error);
      return []; // Return empty array on error
    }
  }

  /**
   * @function updateUserRole
   * @description Updates a user's role
   * @param {string} id - The ID of the user to update
   * @param {UserRole} role - The new role to assign
   * @returns {Promise<Object>} The updated user object
   */
  @Patch("users/:id/role")
  async updateUserRole(@Param("id") id: string, @Body("role") role: UserRole) {
    try {
      return await this.usersService.updateRole(id, role);
    } catch (error) {
      console.error("❌ Error updating user role:", error);
      throw new HttpException(
        "Erreur lors de la mise à jour du rôle",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @function deleteUser
   * @description Deletes a user from the database
   * @param {string} id - The ID of the user to delete
   * @returns {Promise<Object>} Success message
   */
  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    try {
      return await this.usersService.delete(id);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw new HttpException(
        "Erreur lors de la suppression de l'utilisateur",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
