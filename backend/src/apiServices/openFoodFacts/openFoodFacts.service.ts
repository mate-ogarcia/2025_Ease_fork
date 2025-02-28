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
import { delay, firstValueFrom } from "rxjs";

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

  // ========================================================================
  // ======================== SEARCH ALTERNATIVE PRODUCTS IN THE API
  // ========================================================================
  /**
   * @brief Searches for similar products on Open Food Facts using criteria.
   * 
   * @details
   * - Sends multiple requests to fetch similar products based on categories.
   * - Uses throttling to limit simultaneous API calls.
   * - Sorts results based on category relevance and uniqueness.
   * 
   * @param criteria The search criteria:
   *   - `productId` (optional): The product's ID to prioritize in results.
   *   - `category` (optional): The product's category.
   * @param page Page number for paginated results (default: 1).
   * @param pageSize Number of results per page (default: 50).
   * @returns {Promise<any[]>} An array of unique similar products.
   * @throws {HttpException} If no criteria are provided or API requests fail.
   */
  async searchSimilarProducts(
    criteria: { productId?: string, category?: string },
    page: number = 1,
    pageSize: number = 50
  ): Promise<any[]> {
    try {
      const { productId, category } = criteria;
      console.log(`🔎 Searching for similar products to: ${productId || "N/A"}`);

      if (!category) {
        throw new HttpException("❌ No category provided for search.", HttpStatus.BAD_REQUEST);
      }

      const baseUrl = "https://fr.openfoodfacts.org/cgi/search.pl?";
      const userAgent = { headers: { "User-Agent": "LocalFoodChoices - Windows - Version 1.0" } };

      // Step 1: Extract & limit categories (max 5)
      const categoriesToSearch = category.split(",").slice(0, 5).map(c => c.trim());

      // Step 2: Generate separate API requests for each category
      const fetchRequests = categoriesToSearch.map((cat, index) => {
        return async () => {
          const query = `action=process&tagtype_${index}=categories&tag_contains_${index}=contains&tag_${index}=${encodeURIComponent(cat)}&page=${page}&page_size=${pageSize}&json=true`;
          const url = `${baseUrl}${query}`;
          console.log(`🔍 Fetching: ${url}`);

          try {
            const response = await firstValueFrom(this.httpService.get(url, userAgent));
            return response.data?.products || [];
          } catch (error) {
            console.error(`❌ Error fetching from ${url}:`, error.message);
            return [];
          }
        };
      });

      // Step 3: Execute requests in batches (2 concurrent requests max)
      const results = await this.executeRequestsInBatches(fetchRequests, 2);

      // Step 4: Deduplicate and sort results by relevance
      const uniqueProducts = this.deduplicateAndSortProducts(results.flat(), categoriesToSearch);

      // Step 5: Prioritize the searched product if found
      if (productId) {
        this.prioritizeProduct(uniqueProducts, productId);
      }

      console.log(`🌍 Found ${uniqueProducts.length} unique similar products.`);
      return uniqueProducts.slice(0, 20); // Limit to 20 results

    } catch (error) {
      console.error("❌ Error retrieving similar products:", error.message);
      throw new HttpException("Error fetching similar products from Open Food Facts.", HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * @brief Executes API requests in batches to avoid rate-limiting issues.
   * 
   * @param requests Array of async functions returning product data.
   * @param batchSize Maximum number of concurrent requests.
   * @returns {Promise<any[]>} Combined results from all API requests.
   */
  private async executeRequestsInBatches(requests: (() => Promise<any[]>)[], batchSize: number): Promise<any[]> {
    let results: any[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results = results.concat(batchResults.flat());
      await this.delay(1000); // Introduce a small delay between batches
    }

    return results;
  }

  /**
   * @brief Removes duplicate products and sorts them by category relevance.
   * 
   * @param products Array of fetched products.
   * @param categoriesToSearch List of categories used in the search.
   * @returns {any[]} Unique and sorted product list.
   */
  private deduplicateAndSortProducts(products: any[], categoriesToSearch: string[]): any[] {
    const productMap = new Map<string, any>();

    products.forEach(product => productMap.set(product.code, product)); // Deduplicate

    return Array.from(productMap.values()).sort((a, b) => {
      const aScore = this.calculateCategoryRelevance(a, categoriesToSearch);
      const bScore = this.calculateCategoryRelevance(b, categoriesToSearch);
      return bScore - aScore; // Sort by relevance score
    });
  }

  /**
   * @brief Calculates a relevance score based on category match.
   * 
   * @param product Product object containing categories.
   * @param searchCategories Categories used in the search.
   * @returns {number} Score representing category match strength.
   */
  private calculateCategoryRelevance(product: any, searchCategories: string[]): number {
    const productCategories = Array.isArray(product.categories) ? product.categories : [product.categories];
    return productCategories.filter(c => searchCategories.includes(c)).length;
  }

  /**
   * @brief Moves the searched product to the top of the results if found.
   * 
   * @param products Array of products.
   * @param productId ID of the searched product.
   */
  private prioritizeProduct(products: any[], productId: string): void {
    const index = products.findIndex(p => p.code === productId);
    if (index !== -1) {
      const [product] = products.splice(index, 1);
      products.unshift(product);
      console.log(`Searched product (${productId}) prioritized.`);
    }
  }

  /**
   * @brief Creates a delay for throttling API requests.
   * 
   * @param ms Delay time in milliseconds.
   * @returns {Promise<void>} A promise that resolves after the given time.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
