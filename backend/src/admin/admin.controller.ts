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
   * @brief Retrieves all users from the database.
   * @details This endpoint fetches a list of all registered users.
   *
   * @param {any} request - The request object containing user authentication details.
   * @returns {Promise<any[]>} A list of registered users.
   * @throws {HttpException} If an error occurs while retrieving users.
   */
  @Get("users")
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getAllUsers(@Req() request: any): Promise<any[]> {
    try {
      // Get all the users from de DB
      const users = await this.usersService.findAll();

      if (!users || users.length === 0) {
        return [];
      }

      return users;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @brief Updates a user's role.
   * @details This endpoint updates the role of a specific user.
   * @details This endpoint updates the role of a specific user.
   *
   * @param {string} id - The ID of the user to update.
   * @param {UserRole} role - The new role to assign to the user.
   * @returns {Promise<Object>} The updated user object.
   * @throws {HttpException} If an error occurs during role update.
   * @throws {HttpException} If an error occurs during role update.
   */
  @Put("users/:email/role")
  async updateUserRole(
    @Param("email") email: string,
    @Body("role") role: string
  ) {
    // Decode the email (convert %40 to @ and other encoded characters)
    const decodedEmail = decodeURIComponent(email);

    // Check if the email is valid
    if (!decodedEmail) {
      throw new BadRequestException("Email is required");
    }

    // Check if the role is valid
    if (!role) {
      throw new BadRequestException("Role is required");
    }

    // Validate if the role is a valid value from the UserRole enumeration
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new BadRequestException(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
    }

    try {
      return await this.usersService.updateRole(decodedEmail, role as UserRole);
    } catch (error) {
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
   * @details This endpoint removes a user identified by their ID from the database.
   *
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<Object>} A success message if deletion is successful.
   * @throws {HttpException} If an error occurs during deletion.
   */
  @Delete("users/:email")
  async deleteUser(@Param("email") email: string) {
    try {
      // Decode the email (convert %40 to @ and other encoded characters)
      const decodedEmail = decodeURIComponent(email);

      return await this.usersService.delete(decodedEmail);
    } catch (error) {
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
        return [];
      }

      return requests;
    } catch (error) {
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
    const roles = Object.values(UserRole);
    return roles;
  }

  /**
   * @brief Retrieves the role of the currently authenticated user.
   * @details This endpoint returns the user's role based on their JWT token.
   *
   * @param[in] request The request object containing authentication details.
   * @return The user's role.
   */
  @Get("currentUserRole")
  getCurrentUserRole(@Req() request: any): { role: string } {
    const userRole = request.user?.role;
    return { role: userRole };
  }
}
