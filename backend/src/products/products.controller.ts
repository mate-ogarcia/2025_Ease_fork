/**
 * @file products.controller.ts
 * @brief Controller for handling product-related API endpoints.
 *
 * This controller provides endpoints to select a product, retrieve a product by ID,
 * and fetch all products from the database.
 */

import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Get,
  Param,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * @brief Selects a product based on the provided product ID.
   */
  @Post("select")
  async selectProduct(@Body() body: { productId: string }) {
    if (!body.productId) {
      throw new BadRequestException("❌ Product's ID is required!");
    }

    try {
      return await this.productsService.selectProduct(body.productId);
    } catch (error) {
      console.error("❌ Error selecting product:", error);
      throw new InternalServerErrorException("Error selecting product.");
    }
  }

  /**
   * @brief Retrieves alternative European products.
   */
  @Get("alternativeProducts/:id")
  async getAlternativeProducts(@Param("id") productId: string) {
    try {
      return await this.productsService.getAlternativeProducts(productId);
    } catch (error) {
      console.error("❌ Error retrieving alternative products:", error);
      throw new InternalServerErrorException(
        "Error retrieving alternative products."
      );
    }
  }

  /**
   * @brief Retrieves a product by its ID.
   */
  @Get(":id")
  async getProductById(@Param("id") productId: string) {
    try {
      return await this.productsService.getProductById(productId);
    } catch (error) {
      console.error("❌ Error retrieving product:", error);
      throw new InternalServerErrorException("Error retrieving product.");
    }
  }

  /**
   * @brief Retrieves all products from the database.
   */
  @Get()
  async getAllProducts() {
    try {
      return await this.productsService.getAllProducts();
    } catch (error) {
      console.error("❌ Error retrieving all products:", error);
      throw new InternalServerErrorException("Error retrieving all products.");
    }
  }
}
