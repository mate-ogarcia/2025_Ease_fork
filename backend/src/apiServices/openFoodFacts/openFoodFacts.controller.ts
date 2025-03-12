/**
 * @file openFoodFacts.controller.ts
 * @brief Controller for handling OpenFoodFacts API requests.
 *
 * This controller provides endpoints to search for products in the OpenFoodFacts database.
 * It delegates the actual data fetching to the `openFoodFactsService` service.
 * 
 * Features:
 * - Search for products by name with pagination support.
 * - Handles query parameters for page numbers.
 * - Provides clear HTTP GET endpoints.
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { OpenFoodFactsService } from "./openFoodFacts.service";

/**
 * @class openFoodFactsController
 * @brief Controller class for OpenFoodFacts-related routes.
 *
 * This controller handles incoming HTTP requests related to the OpenFoodFacts API.
 * It interacts with the `openFoodFactsService` to perform searches for product information.
 */
@Controller("openFoodFacts")
export class OpenFoodFactsController {

  /**
   * @brief Constructor injecting the OpenFoodFacts service.
   * 
   * @param openFoodFactsService Service responsible for communication with OpenFoodFacts API.
   */
  constructor(
    private openFoodFactsService: OpenFoodFactsService
  ) { }

  /**
   * @brief Searches products by name from OpenFoodFacts.
   * 
   * @details
   * This endpoint allows clients to search for products by their name.  
   * - The product name is passed as a route parameter.  
   * - Pagination is supported through the `page` query parameter.  
   * - Defaults to page 1 if the `page` parameter is not provided.
   *
   * @route GET /openFoodFacts/search/:name?page=2
   * @param name The name of the product to search for.
   * @param page (Optional) The page number for pagination. Defaults to 1.
   * @returns {Promise<any>} A promise resolving to the search results from OpenFoodFacts.
   * 
   * @throws {BadRequestException} If the page number is invalid.
   * @throws {InternalServerErrorException} If there is an issue with the OpenFoodFacts API request.
   * 
   */
  @Get('search/:name')
  async searchProducts(
    @Param('name') name: string,
    @Query('page') page: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    return await this.openFoodFactsService.searchProductsByName(name, pageNumber);
  }

  /**
   * @brief Retrieves product details by its ID.
   * @details Fetches product information from OpenFoodFacts using the provided product ID.
   *
   * @param productId The ID of the product to retrieve.
   * @return The product details.
   */
  @Get('getbyId/:productId')
  async getProductById(
    @Param('productId') productId: string,
  ) {
    return await this.openFoodFactsService.getProductByCode(productId);
  }

  /**
   * @brief Retrieves alternative products based on a given product.
   * @details Searches for similar products in OpenFoodFacts, with pagination support.
   *
   * @param product The product object to find alternatives for.
   * @param page (Optional) The page number for paginated results. Defaults to 1.
   * @return A list of alternative products.
   */
  @Post('alternativeProducts')
  async getAlternativeProducts(@Body() product: any, @Query('page') page: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;

    return await this.openFoodFactsService.searchSimilarProducts(product, pageNumber);
  }


}
