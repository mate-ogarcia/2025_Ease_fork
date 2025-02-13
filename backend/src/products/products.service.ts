/**
 * @file products.service.ts
 * @brief Service for managing product-related operations.
 * 
 * This service handles product selection, retrieval, and alternative product suggestions.
 * It interacts with the database service to fetch product details and apply search criteria.
 * The service is initialized with `onModuleInit` and provides multiple methods for data retrieval.
 * 
 * @module ProductsService
 */

import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ProductsService implements OnModuleInit {
    constructor(private readonly databaseService: DatabaseService) { }

    /**
     * @brief Called when the module is initialized.
     */
    async onModuleInit() {
        console.log("✅ ProductsService module initialized.");
    }

    /**
     * @brief Selects a product based on its ID.
     */
    async selectProduct(productId: string) {
        try {
            console.log("🔹 Fetching product ID:", productId);
            const product = await this.databaseService.getProductById(productId);

            if (!product) {
                throw new NotFoundException(`⚠️ Product with ID "${productId}" not found.`);
            }

            return { success: true, product };
        } catch (error) {
            console.error("❌ Error selecting product:", error);
            throw new InternalServerErrorException("Error selecting product.");
        }
    }

    /**
     * @brief Retrieves alternative European products based on the selected product's attributes.
     * 
     * This method fetches a product by its ID and extracts key attributes (category, tags, and brand)
     * to search for alternative products within the same category and with similar characteristics.
     * It ensures that alternatives are filtered dynamically based on available product details.
     * 
     * @param {string} productId - The ID of the selected product for which alternatives are searched.
     * @returns {Promise<any[]>} A promise resolving with an array of alternative products.
     * @throws {NotFoundException} If the selected product does not exist.
     * @throws {InternalServerErrorException} If an error occurs during the retrieval process.
     */
    async getAlternativeProducts(productId: string): Promise<any[]> {
        try {
            const selectedProduct = await this.databaseService.getProductById(productId);
            if (!selectedProduct) {
                throw new NotFoundException(`⚠️ Product with ID "${productId}" not found.`);
            }

            // Extract search criteria from the selected product
            const searchCriteria = Object.fromEntries(
                Object.entries({
                    category: selectedProduct.category,
                    tags: selectedProduct.tags,
                    brand: selectedProduct.brand
                }).filter(([_, value]) => value !== null && value !== undefined)
            );

            console.log("🔍 Search criteria:", searchCriteria);

            // Retrieve alternative products based on the extracted criteria
            const alternatives = await this.databaseService.getAlternativeProducts(searchCriteria);
            return alternatives;
        } catch (error) {
            console.error("❌ Error retrieving alternative products:", error);
            throw new InternalServerErrorException("Error retrieving alternative products.");
        }
    }

    /**
     * @brief Retrieves a product by its ID.
     */
    async getProductById(productId: string) {
        try {
            console.log(`🔹 Attempting to retrieve product with ID: ${productId}`);
            const product = await this.databaseService.getProductById(productId);

            if (!product) {
                throw new NotFoundException(`⚠️ Product with ID "${productId}" not found.`);
            }

            return product;
        } catch (error) {
            console.error("❌ Error retrieving product:", error);
            throw new InternalServerErrorException("Error retrieving product.");
        }
    }

    /**
     * @brief Retrieves all products from the database.
     */
    async getAllProducts() {
        try {
            return await this.databaseService.getAllProductsData();
        } catch (error) {
            console.error("❌ Error retrieving all products:", error);
            throw new InternalServerErrorException("Error retrieving all products.");
        }
    }
}