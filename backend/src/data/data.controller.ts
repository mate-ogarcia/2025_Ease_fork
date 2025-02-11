/**
 * @file data.controller.ts
 * @brief Controller for handling data-related requests.
 *
 * This controller provides an endpoint to import products into the database.
 */

import { Controller, Post } from "@nestjs/common";
import { DataService } from "./data.service";

@Controller("data")
export class DataController {
  constructor(private readonly dataService: DataService) {}

  /**
   * Endpoint to trigger the import of products into the database.
   * @returns {Promise<void>} A promise resolving when the import process is complete.
   */
  @Post("import-products")
  async importProducts() {
    return this.dataService.insertProductsToDatabase();
  }
}
