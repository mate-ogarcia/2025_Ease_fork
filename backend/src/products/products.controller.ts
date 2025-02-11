/**
 * @file products.controller.ts
 * @brief Controller for handling product-related API endpoints.
 * 
 * This controller provides endpoints to select a product, retrieve a product by ID,
 * and fetch all products from the database.
 */

import { Controller, Post, Body, BadRequestException, InternalServerErrorException, Get, Param, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Controller('products')  
export class ProductsController {
    constructor(private readonly databaseService: DatabaseService) {}

    /**
     * @brief Selects a product based on the provided product ID.
     * 
     * This method retrieves a product from the database using the given ID.
     * If the product is found, it returns the product details; otherwise, it throws an error.
     * 
     * @param {object} body - The request body containing the product ID.
     * @returns {Promise<object>} The selected product details.
     * @throws {BadRequestException} If the product ID is missing.
     * @throws {NotFoundException} If the product is not found.
     * @throws {InternalServerErrorException} If an unexpected error occurs.
     */
    @Post('select')
    async selectProduct(@Body() body: { productId: string }) {
      if (!body.productId) {
        throw new BadRequestException("❌ Product's ID is required!");
      }

      try {
        console.log("🔹 Request received for product ID (products.controller.ts):", body.productId);
        const product = await this.databaseService.getProductById(body.productId);

        if (!product) {
          console.warn(`⚠️ Product with ID "${body.productId}" not found. (products.controller.ts)`);
          throw new NotFoundException("Product not found.");
        }

        return { success: true, product };
      } catch (error) {
        console.error("❌ Error selecting product:", error);
        throw new InternalServerErrorException("Error selecting product.");
      }
    }

    /**
     * @brief Retrieves a product by its ID.
     * 
     * This method fetches a product from the database using its ID.
     * 
     * @param {string} productId - The ID of the product to retrieve.
     * @returns {Promise<object>} The product details.
     * @throws {NotFoundException} If the product is not found.
     * @throws {InternalServerErrorException} If an unexpected error occurs.
     */
    @Get(':id')
    async getProductById(@Param('id') productId: string) {
      try {
        console.log(`🔹 Attempting to retrieve product with ID: ${productId}`);
    
        const product = await this.databaseService.getProductById(productId);
    
        if (!product) {
          console.warn(`⚠️ Product with ID "${productId}" not found.`);
          throw new NotFoundException(`Product with ID "${productId}" not found.`);
        }
    
        return product;
      } catch (error) {
        console.error("❌ Error retrieving product:", error);
        throw new InternalServerErrorException("Error retrieving product.");
      }
    }
    
    /**
     * @brief Retrieves all products from the database.
     * 
     * This method fetches all stored products from the database.
     * 
     * @returns {Promise<object[]>} An array of all available products.
     */
    @Get()
    async getAllProducts() {
      return await this.databaseService.getAllData();
    }
}
