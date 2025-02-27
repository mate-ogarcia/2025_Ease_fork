/**
 * @file openFoodFacts.service.ts
 * @brief Service for interacting with the Open Food Facts API.
 * 
 * This service provides methods to:
 * - Search products by name.
 * - Retrieve a product by its code.
 * - Find similar products based on provided criteria.
 * 
 */

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from "rxjs";

/**
 * @class OpenFoodFactsService
 * @brief Handles all interactions with the Open Food Facts API.
 * 
 * Provides functionalities to:
 * - Search products by name.
 * - Retrieve product details by code.
 * - Find similar products based on criteria like name, brand, and category.
 */
@Injectable()
export class OpenFoodFactsService {

  /**
   * @constructor
   * @param httpService HTTP service injected for making external API calls.
   */
  constructor(private readonly httpService: HttpService) { }

  /**
   * @brief Searches for products on Open Food Facts by product name.
   * 
   * @param name The name of the product to search for.
   * @param page The page number for paginated results (default: 1).
   * @param pageSize The number of results per page (default: 20).
   * @returns {Promise<any>} The search result data from Open Food Facts.
   * 
   * @throws {HttpException} If the Open Food Facts API request fails.
   */
  async searchProductsByName(name: string, page: number = 1, pageSize: number = 20): Promise<any> {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&page=${page}&page_size=${pageSize}&search_simple=1&action=process&json=1`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      console.error(`❌ Error searching products by name: ${error.message}`);
      throw new HttpException(
        'Error searching products in OpenFoodFacts',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * @brief Retrieves product details from Open Food Facts by product code.
   * 
   * @param code The barcode or product code.
   * @returns {Promise<any>} The product details if found.
   * 
   * @throws {HttpException} If the product is not found or the API call fails.
   */
  async getProductByCode(code: string): Promise<any> {
    const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data.product;
    } catch (error) {
      console.error("❌ Error retrieving product from OFF:", error);
      throw new HttpException("Product not found on Open Food Facts.", HttpStatus.NOT_FOUND);
    }
  }

  /**
   * @brief Searches for similar products on Open Food Facts using criteria.
   * 
   * @param criteria The search criteria object:
   * - `productName` (optional): Name of the product.
   * - `brand` (optional): Brand of the product.
   * - `category` (optional): Product category.
   * @param page The page number for paginated results (default: 1).
   * @param pageSize The number of results per page (default: 20).
   * @returns {Promise<any[]>} An array of similar products.
   * 
   * @throws {HttpException} If no criteria are provided or the API request fails.
  */
  // TODO: change the logic to get more alternative
  async searchSimilarProducts(
    criteria: { productName?: string; brand?: string; category?: string, tags?: string[] },
    page: number = 1,
    pageSize: number = 20
  ): Promise<any[]> {
    try {
      const { productName, brand, category, tags } = criteria;

      // Build the search query from provided criteria
      const searchTerms = [productName, brand, category, ...(tags || [])].filter(Boolean).join(' ');

      if (!searchTerms) {
        throw new HttpException("No search criteria provided.", HttpStatus.BAD_REQUEST);
      }

      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerms)}&page=${page}&page_size=${pageSize}&search_simple=1&action=process&json=1`;

      const response = await firstValueFrom(this.httpService.get(url));

      if (!response.data?.products) {
        console.warn("🔎 No similar products found on Open Food Facts.");
        return [];
      }

      console.log(`🌍 OFF - Similar products found: ${response.data.products.length}`);
      return response.data.products;

    } catch (error) {
      console.error("❌ Error searching similar products on OFF:", error.message);
      throw new HttpException(
        "Error searching for products on Open Food Facts.",
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
