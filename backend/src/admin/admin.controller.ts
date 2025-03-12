/**
 * @file admin.controller.ts
 * @brief Controller for administrative operations.
 * @details This controller handles various administrative operations such as 
 * user management, product request retrieval, and role management.
 * Authentication guards ensure that only authorized administrators can access these endpoints.
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
  BadRequestException,
  Put,
  NotFoundException,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsersService } from "../users/users.service";
import { UserRole } from "src/auth/enums/roles.enum";
import { AdminService } from "./admin.service";

/**
 * @brief Controller responsible for administrative operations.
 * @details This controller is secured with authentication and role-based authorization.
 * It provides endpoints for managing users and handling product requests.
 */
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class AdminController {

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private adminService: AdminService,
  ) { }

  /**
   * @brief Retrieves all users from the database, excluding SuperAdmins and the current user.
   * @details This endpoint fetches a filtered list of registered users.
   * This endpoint is accessible to both ADMIN and SUPERADMIN roles.
   *
   * @param {any} request - The request object containing user authentication details.
   * @returns {Promise<any[]>} A filtered list of registered users.
   * @throws {HttpException} If an error occurs while retrieving users.
   */
  @Get("users")
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getAllUsers(@Req() request: any): Promise<any[]> {
    try {
      // Récupérer l'email de l'utilisateur connecté depuis la requête
      const currentUserEmail = request.user?.email;
      console.log(`🔍 Getting users, excluding current user: ${currentUserEmail}`);

      // Passer l'email à la méthode findAll pour exclure l'utilisateur actuel
      const users = await this.usersService.findAll(currentUserEmail);

      if (!users || users.length === 0) {
        console.warn("⚠️ No users found.");
        return [];
      }

      return users;
    } catch (error) {
      console.error(`❌ Error in getAllUsers: ${error.message}`);
      throw new HttpException(
        `Failed to retrieve users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @brief Updates a user's role.
   * @details This endpoint updates the role of a specific user.
   *
   * @param {string} email - The email of the user to update.
   * @param {UserRole} role - The new role to assign to the user.
   * @returns {Promise<Object>} The updated user object.
   * @throws {HttpException} If an error occurs during role update.
   */
  @Put("users/:email/role")
  async updateUserRole(
    @Param("email") email: string,
    @Body("role") role: string
  ) {
    // Décoder l'email (convertir %40 en @ et autres caractères encodés)
    const decodedEmail = decodeURIComponent(email);
    console.log(`🔄 Requête de mise à jour de rôle reçue pour ${decodedEmail} vers ${role}`);

    // Vérifier si l'email est valide
    if (!decodedEmail) {
      throw new BadRequestException("Email is required");
    }

    // Vérifier si le rôle est valide
    if (!role) {
      throw new BadRequestException("Role is required");
    }

    // Vérifier si le rôle est une valeur valide de l'énumération UserRole
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      console.warn(`⚠️ Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
      throw new BadRequestException(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
    }

    try {
      const result = await this.usersService.updateRole(decodedEmail, role as UserRole);
      console.log(`✅ Rôle mis à jour avec succès pour ${decodedEmail}`);
      return result;
    } catch (error) {
      console.error(`❌ Error updating user role for ${decodedEmail}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        `Error updating user role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @brief Deletes a user from the database.
   * @details This endpoint removes a user identified by their email from the database.
   *
   * @param {string} email - The email of the user to delete.
   * @returns {Promise<Object>} A success message if deletion is successful.
   * @throws {HttpException} If an error occurs during deletion.
   */
  @Delete("users/:email")
  async deleteUser(@Param("email") email: string) {
    try {
      return await this.usersService.delete(email);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw new HttpException(
        "Error deleting user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @brief Retrieves product requests requiring administrative review.
   * @details This endpoint fetches product requests that require an admin's review 
   * (e.g., product additions, edits, or deletions).
   * 
   * @returns {Promise<any[]>} A list of product requests.
   * @throws {HttpException} If an error occurs during retrieval.
   */
  @Get('getRequests')
  async getRequestsProduct() {
    try {
      const requests = await this.adminService.getRequestsProduct();

      if (!requests || requests.length === 0) {
        console.warn("⚠️ No product requests found.");
        return [];
      }

      return requests;
    } catch (error) {
      console.error('❌ Error retrieving product requests:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @brief Updates an entity (product or brand) through an API endpoint.
   * 
   * @details This endpoint updates an entity in the database by calling the `AdminService.updateEntity()` method.
   * If the entity ID or update fields are missing, it returns a `BAD_REQUEST` error.
   * 
   * @route PATCH /updateEntity/:type/:id
   * 
   * @param {string} type - The type of entity to update ("product" or "brand"), extracted from URL parameters.
   * @param {string} id - The unique identifier of the entity, extracted from URL parameters.
   * @param {Record<string, any>} valueToUpdate - The fields to update, provided in the request body.
   * 
   * @returns {Promise<any>} - The updated entity.
   * 
   * @throws {HttpException} - If required parameters are missing (`BAD_REQUEST`) or if an internal server error occurs.
   */
  @Patch('updateEntity/:type/:id')
  async updateEntity(
    @Param("type") type: string,
    @Param("id") id: string,
    @Body() valueToUpdate: Record<string, any>
  ) {
    try {
      if (!id || Object.keys(valueToUpdate).length === 0) {
        throw new HttpException("Entity ID and at least one field to update are required", HttpStatus.BAD_REQUEST);
      }

      // Call the generic service method to update the entity
      const updatedEntity = await this.adminService.updateEntity(type, id, valueToUpdate);
      return updatedEntity;
    } catch (error) {
      console.error(`❌ Error updating ${type}:`, error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Retrieves all available user roles.
   * @details This endpoint returns a list of all possible user roles in the system.
   *
   * @returns {UserRole[]} An array of all available user roles.
   */
  @Get("roles")
  getAllRoles(): string[] {
    console.log("🔍 Getting all roles");
    const roles = Object.values(UserRole);
    console.log("✅ Available roles:", roles);
    return roles;
  }

  /**
   * @brief Récupère le rôle de l'utilisateur actuellement connecté.
   * @details Cet endpoint retourne le rôle de l'utilisateur à partir de son token JWT.
   *
   * @param {any} request - L'objet requête contenant les informations d'authentification.
   * @returns {string} Le rôle de l'utilisateur.
   */
  @Get("currentUserRole")
  getCurrentUserRole(@Req() request: any): { role: string } {
    const userRole = request.user?.role;
    console.log("🔍 Current user role:", userRole);
    return { role: userRole };
  }
}
