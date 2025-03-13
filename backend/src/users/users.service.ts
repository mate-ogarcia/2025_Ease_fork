/**
 * @file users.service.ts
 * @brief Service for managing user operations.
 *
 * This service handles user-related operations such as retrieval,
 * creation, and validation of user existence in the database.
 */

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { UserRole } from "src/auth/enums/roles.enum";
/**
 * @brief Service responsible for user management operations.
 * @details This service provides methods for creating, retrieving, updating, and deleting users.
 * It interacts with the DatabaseService to perform database operations.
 */
@Injectable()
export class UsersService {
  /**
   * @brief Constructor for UsersService.
   * @param {DatabaseService} databaseService - Service for handling database operations.
   */
  constructor(private readonly databaseService: DatabaseService) { }

  /**
   * @brief Searches for a user by email.
   * @details This method queries the database to check if a user exists with the given email.
   *
   * @param {string} email - The email of the user to search for.
   * @returns {Promise<any>} - The user object if found.
   * @throws {NotFoundException} If the user is not found.
   * @throws {InternalServerErrorException} If an error occurs during the search.
   */
  async findByEmail(email: string) {
    try {
      // Calls databaseService to retrieve the user
      const user = await this.databaseService.getUserByEmail(email);
      if (!user) {
        console.warn(`⚠️ User not found for email: ${email}`);
        throw new NotFoundException("User not found.");
      }
      // Return user data directly
      return {
        email: user.email,
        username: user.username,
        password: user.password,
        role: user.role,
      };
    } catch (error) {
      console.error(`❌ Error finding user by email ${email}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

  /**
   * @brief Creates a new user after verifying their existence.
   * @details This method checks if a user already exists before inserting them into the database.
   *
   * @param {any} user - The user object containing email and password.
   * @returns {Promise<any>} - The created user object.
   * @throws {InternalServerErrorException} If the user already exists or if an error occurs during creation.
   */
  async createUser(user: any) {
    try {
      const result = await this.databaseService.addUser(
        user.username,
        user.email,
        user.password,
        user.role
      );
      return result;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new InternalServerErrorException("Error during registration.");
    }
  }

  /**
   * @brief Retrieves all users from the database, excluding SuperAdmins and the current user.
   * @details This method queries the database to get a filtered list of registered users.
   *
   * @param {string} currentUserEmail - Email of the currently connected user to exclude.
   * @returns {Promise<any[]>} Array of filtered user objects.
   * @throws {InternalServerErrorException} If an error occurs during retrieval.
   */
  async findAll(): Promise<any[]> {
    try {
      const users = await this.databaseService.getFilteredUsers();
      return users;
    } catch (error) {
      console.error("❌ UsersService - Error retrieving filtered users:", error);
      throw new InternalServerErrorException("Error retrieving users list.");
    }
  }

  /**
   * @brief Updates a user's role.
   * @details This method updates the role of a user with the specified email.
   *
   * @param {string} email - The email of the user to update.
   * @param {UserRole} role - The new role to assign.
   * @returns {Promise<any>} The updated user object.
   * @throws {NotFoundException} If the user with the specified email is not found.
   * @throws {InternalServerErrorException} If an error occurs during the update.
   */
  async updateRole(email: string, role: UserRole): Promise<any> {
    try {
      const result = await this.databaseService.updateUserRole(email, role);
      if (!result) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return result;
    } catch (error) {
      console.error("❌ Error updating user role:", error);
      throw new InternalServerErrorException("Error updating user role.");
    }
  }

  /**
   * @brief Deletes a user from the database.
   * @details This method removes a user with the specified email from the database.
   *
   * @param {string} email - The email of the user to delete.
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the user with the specified email is not found.
   * @throws {InternalServerErrorException} If an error occurs during deletion.
   */
  async delete(email: string): Promise<void> {
    try {
      const result = await this.databaseService.deleteUser(email);
      if (!result) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw new InternalServerErrorException("Error deleting user.");
    }
  }
}
