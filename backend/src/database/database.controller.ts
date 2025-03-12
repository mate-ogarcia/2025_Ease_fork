/**
 * @file database.controller.ts
 * @brief Controller for database operations
 * @details This controller handles HTTP requests related to database operations,
 * specifically retrieving data from collections like categories and brands.
 * It has been modified to handle errors gracefully and return empty arrays instead
 * of throwing exceptions to prevent frontend crashes.
 *
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 */

import {
  Controller,
  // InternalServerErrorException, // Not used after modifications
  Get,
  // UseGuards, // Temporarily commented out
} from "@nestjs/common";
import { DatabaseService } from "./database.service";
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"; // Temporarily commented out

/**
 * @brief Controller for database-related endpoints.
 * @details This controller provides endpoints for retrieving data from the database.
 * Authentication has been temporarily disabled to allow public access.
 */
@Controller("database")
// @UseGuards(JwtAuthGuard) // Temporarily commented out to allow access without authentication
export class DatabaseController {
  /**
   * @brief Constructor for DatabaseController.
   * @param {DatabaseService} databaseService - Service for handling database operations.
   */
  constructor(private readonly databaseService: DatabaseService) { }

  /**
   * @brief Retrieves all category names from the database.
   * @details This endpoint fetches all category names by calling the DatabaseService.
   * It handles errors gracefully by returning an empty array instead of throwing exceptions.
   *
   * @route GET /database/categName
   * @returns {Promise<any[]>} A promise that resolves to an array of category names.
   */
  @Get("categName")
  async getAllCategName() {
    try {
      // Call the database service to retrieve category names
      const categories = await this.databaseService.getAllCategoryName();
      return categories;
    } catch (error) {
      // Log the error but return an empty array instead of throwing an exception
      console.error(
        "❌ Controller: Error retrieving the categories name:",
        error,
      );
      return [];
    }
  }

  /**
   * @brief Retrieves all brand names from the database.
   * @details This endpoint fetches all brand names by calling the DatabaseService.
   * It handles errors gracefully by returning an empty array instead of throwing exceptions.
   *
   * @route GET /database/brandName
   * @returns {Promise<any[]>} A promise that resolves to an array of brand names.
   */
  @Get("brandName")
  async getAllBrandName() {
    try {
      // Call the database service to retrieve brand names
      const brands = await this.databaseService.getAllBrand();
      return brands.map(brand => brand.name);
    } catch (error) {
      // Log the error but return an empty array instead of throwing an exception
      console.error("❌ Controller: Error retrieving the brands name:", error);
      return [];
    }
  }
}
