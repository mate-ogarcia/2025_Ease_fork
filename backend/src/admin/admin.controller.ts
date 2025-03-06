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
@Roles(UserRole.ADMIN)
export class AdminController {

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private adminService: AdminService,
  ) { }

  /**
   * @brief Initializes the first administrator account.
   * @details This endpoint creates an initial administrator user with the provided credentials.
   *
   * @param {Object} createAdminDto - The DTO containing email and password for the new admin.
   * @returns {Promise<Object>} A response containing the created admin details.
   * @throws {HttpException} If an error occurs during admin creation.
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
      console.error("❌ Error during administrator initialization:", error);
      throw new HttpException(
        "Error during administrator initialization",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @brief Retrieves all users from the database.
   * @details This endpoint fetches a list of all registered users.
   *
   * @param {any} request - The request object containing user authentication details.
   * @returns {Promise<any[]>} A list of registered users.
   * @throws {HttpException} If an error occurs while retrieving users.
   */
  @Get("users")
  async getAllUsers(@Req() request: any): Promise<any[]> {
    try {
      // Ensure the user has admin privileges
      if (!request.user || request.user.role !== UserRole.ADMIN) {
        console.error(`❌ Unauthorized attempt to access getAllUsers by:`, request.user || "Unknown user");
        throw new HttpException(
          "Insufficient permissions to access user data",
          HttpStatus.FORBIDDEN
        );
      }
      const users = await this.usersService.findAll();

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
   * @param {string} id - The ID of the user to update.
   * @param {UserRole} role - The new role to assign to the user.
   * @returns {Promise<Object>} The updated user object.
   * @throws {HttpException} If an error occurs during role update.
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
   * @details This endpoint removes a user identified by their ID from the database.
   *
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<Object>} A success message if deletion is successful.
   * @throws {HttpException} If an error occurs during deletion.
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
   * @brief Updates a product's information.
   * 
   * @details This endpoint allows administrators to update a product's details. 
   * It ensures that a valid `productId` is provided and that at least one field 
   * is specified for updating before calling the `AdminService.updateRequest()` method.
   * 
   * @route PATCH /admin/updateProduct
   * 
   * @param {string} productId - The unique ID of the product to update (provided in the request body).
   * @param {Record<string, any>} valueToUpdate - An object containing the fields to be updated.
   * 
   * @returns {Promise<any>} - A promise resolving to the updated product data.
   * 
   * @throws {HttpException} If the request is invalid (missing product ID or update fields) 
   * or if an error occurs during the update process.
   */
  @Patch('updateProduct')
  async updateProduct(@Body("productId") productId: string, @Body() valueToUpdate: Record<string, any>) {
    try {
      // Ensure productId is provided and at least one field is being updated
      if (!productId || Object.keys(valueToUpdate).length === 0) {
        throw new HttpException(
          "Product ID and at least one field to update are required",
          HttpStatus.BAD_REQUEST
        );
      }

      // Call the admin service to process the update request
      const updatedProduct = await this.adminService.updateRequest(productId, valueToUpdate);
      return updatedProduct;
    } catch (error) {
      console.error("❌ Error updating the product:", error);
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
