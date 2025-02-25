/**
 * @file openFoodFacts.service.ts
 * @brief Service for interacting with the OpenFoodFacts API.
 *
 * This service provides methods to communicate with the OpenFoodFacts API to:
 * - Search for products by name.
 * - Handle pagination and query construction.
 *
 * @note The service uses `HttpService` (from `@nestjs/axios`) to make HTTP requests.
 * @warning Ensure that `HttpService` is correctly injected and available in the module.
 * 
 * Features:
 * - Simple product search by name.
 * - Supports pagination and customizable page sizes.
 * - Handles errors and returns appropriate HTTP exceptions.
 */

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

/**
 * @class openFoodFactsService
 * @brief Service class to interact with the OpenFoodFacts API.
 *
 * This service handles the logic to fetch product data from OpenFoodFacts based on search terms.
 * It provides methods to perform product searches with pagination support.
 */
@Injectable()
export class openFoodFactsService {
    httpService: any;  // HttpService instance to make HTTP requests.

    /**
     * @brief Searches products by name using the OpenFoodFacts API.
     *
     * @details
     * This method sends a GET request to the OpenFoodFacts API with the provided search term.  
     * It supports pagination and allows customization of the page size.
     *
     * Search Criteria:  
     * - Product name (search term).  
     * - Page number (defaults to 1 if not provided).  
     * - Page size (defaults to 20).  
     *
     * @param name The product name to search for.
     * @param page (Optional) The page number for paginated results (default: 1).
     * @param pageSize (Optional) The number of results per page (default: 20).
     * @returns {Promise<any>} A promise resolving to the API response containing the search results.
     * 
     * @throws {HttpException} Returns a 502 Bad Gateway error if the request to OpenFoodFacts fails.
     * 
     */
    async searchProductsByName(name: string, page: number = 1, pageSize: number = 20): Promise<any> {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&page=${page}&page_size=${pageSize}&search_simple=1&action=process&json=1`;
        try {
          const response = await firstValueFrom(this.httpService.get(url));
          return response;
        } catch (error) {
          throw new HttpException(
            'Error while searching for products in OpenFoodFacts',
            HttpStatus.BAD_GATEWAY,
          );
        }
    }
}
