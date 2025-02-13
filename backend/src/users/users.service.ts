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

@Injectable()
export class UsersService {
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
      // 🔹 Calls databaseService to retrieve the user
      const user = await this.databaseService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException("User not found.");
      }

      return user;
    } catch (error) {
      console.error("❌ Error finding user:", error);
      throw new InternalServerErrorException("Internal server error.");
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
  async create(user: any) {
    try {
      const existingUser = await this.findByEmail(user.email).catch(() => null);
      if (existingUser) {
        throw new InternalServerErrorException("User already exists.");
      }

      const id = `user::${user.email}`;
      // await this.databaseService.insertDocument("UsersBDD", id, user);
      return { id, ...user };
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new InternalServerErrorException("Error during registration.");
    }
  }
}
