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

@Controller("database")
// @UseGuards(JwtAuthGuard) // Temporarily commented out to allow access without authentication
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * @function getAllCategName
   * @description
   * This endpoint retrieves all category names from the database by calling the `getAllCategName` method of the `DatabaseService`.
   * It returns the list of category names or an empty array in case of failure.
   *
   * @route GET /database/categName
   * @returns {Promise<any[]>} A promise that resolves to an array of category names.
   */
  @Get("categName")
  async getAllCategName() {
    try {
      console.log("📊 Controller: Retrieving all category names...");
      // Call the database service to retrieve category names
      const categories = await this.databaseService.getAllCategName();
      console.log(`📊 Controller: Retrieved ${categories.length} categories`);
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
   * @function getAllBrandName
   * @description
   * This endpoint retrieves all brand names from the database by calling the `getAllBrandName` method of the `DatabaseService`.
   * It returns the list of brand names or an empty array in case of failure.
   *
   * @route GET /database/brandName
   * @returns {Promise<any[]>} A promise that resolves to an array of brand names.
   */
  @Get("brandName")
  async getAllBrandName() {
    try {
      console.log("📊 Controller: Retrieving all brand names...");
      // Call the database service to retrieve brand names
      const brands = await this.databaseService.getAllBrandName();
      console.log(`📊 Controller: Retrieved ${brands.length} brands`);
      return brands;
    } catch (error) {
      // Log the error but return an empty array instead of throwing an exception
      console.error("❌ Controller: Error retrieving the brands name:", error);
      return [];
    }
  }
}
