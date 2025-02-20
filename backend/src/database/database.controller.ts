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

    @Get("brandName")
    async getAllBrandName() {
        try {
            // Call the database service to retrieve brand names
            return await this.databaseService.getAllBrandName()
        } catch (error) {
            // Log the error and throw an InternalServerErrorException if something goes wrong
            console.error("❌ Error retrieving the brands name:", error);
            throw new InternalServerErrorException(
                "Error retrieving the brands name."
            );
        }
    }
}
