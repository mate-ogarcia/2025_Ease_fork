import { Injectable, OnModuleInit } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class RequestHandler {
  constructor(private readonly databaseService: DatabaseService) {}
  /**
   * @brief Processes a search query
   *
   * This method receives a search query and checks if it is empty.
   * If it is not empty, the search query will be processed.
   *
   * @param {string} searchQuery - The search query to process.
   */
  async processSearch(searchQuery: string) {
    if (!searchQuery.trim()) {
      // Check if the string is empty or just whitespace
      console.log("Search query is empty.");
      return; // Early return if search query is empty
    }

    try {
      // Call the searchQuery method from the database service
      const searchResults = await this.databaseService.searchQuery(searchQuery);

      // Return the search results to the controller
      return searchResults;
    } catch (error) {
      console.error("Error during search:", error);
    }
  }
}