/**
 * @controller DatabaseController
 * @description
 * This controller handles requests related to database operations, specifically retrieving data from the categories collection.
 */

import {
    Controller,
    InternalServerErrorException,
    Get,
} from "@nestjs/common";
import { DatabaseService } from "./database.service";

@Controller("database")
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) { }

    /**
     * @function getAllCategName
     * @description
     * This endpoint retrieves all category names from the database by calling the `getAllCategName` method of the `DatabaseService`.
     * It returns the list of category names or an error message in case of failure.
     * 
     * @route GET /database/categName
     * @returns {Promise<any[]>} A promise that resolves to an array of category names.
     * 
     * @throws {InternalServerErrorException} If an error occurs during the retrieval process.
     */
    @Get("categName")
    async getAllCategName() {
        try {
            // Call the database service to retrieve category names
            return await this.databaseService.getAllCategName()
        } catch (error) {
            // Log the error and throw an InternalServerErrorException if something goes wrong
            console.error("❌ Error retrieving the categories name:", error);
            throw new InternalServerErrorException(
                "Error retrieving the categories name."
            );
        }
    }

    /**
     * @brief Retrieves all brand names from the database.
     *
     * @details
     * This endpoint handles HTTP GET requests to the `/brandName` route.  
     * It calls the `getAllBrandName` method from the `DatabaseService` to fetch a list of brand names stored in the database.
     * 
     * @route GET /brandName
     * @returns {Promise<string[]>} A promise resolving to an array of brand names.
     * @throws {InternalServerErrorException} If an error occurs while retrieving the brand names.
     */
    @Get("brandName")
    async getAllBrandName() {
        try {
            return await this.databaseService.getAllBrandName(); ///< Fetches brand names from the database service
        } catch (error) {
            console.error("❌ Error retrieving the brands name:", error);
            throw new InternalServerErrorException("Error retrieving the brands name.");
        }
    }

}
