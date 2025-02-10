import { Injectable, OnModuleInit } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class RequestHandler implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * @brief Called when the module is initialized.
   * You can use this method to perform any setup or initialization tasks.
   */
  async onModuleInit() {
    // TODO ? IDK if needed
    console.log("RequestHandler module initialized.");
  }

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
    console.log("Processing search for:", searchQuery);

    try {
      // Call the searchQuery method from the database service
      const searchResults = await this.databaseService.searchQuery(searchQuery);

      // Log or return the search results as needed
      console.log(
        "Search results (requestHandler.service.ts): ",
        searchResults
      );

      // Return the search results to the controller
      return searchResults;
    } catch (error) {
      console.error("Error during search:", error);
    }
  }
}
