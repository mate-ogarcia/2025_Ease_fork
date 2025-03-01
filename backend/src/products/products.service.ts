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
// Service
import { DatabaseService } from "../database/database.service";
import { OpenFoodFactsService } from "src/openFoodFacts/openFoodFacts.service";

@Injectable()
export class ProductsService implements OnModuleInit {
    constructor(
        private databaseService: DatabaseService,
        private openFoodFactsService: OpenFoodFactsService,
    ) { }

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
                    searchedProductID: productId,
                    category: selectedProduct.category,
                    tags: selectedProduct.tags,
                    brand: selectedProduct.brand
                }).filter(([_, value]) => value !== null && value !== undefined)
            );

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

    // ========================== IN PROGRESS
    // TODO :
    /**
     * @brief Retrieves the source product and finds alternatives based on business logic.
     * 
     * **Logic Summary:**  
     * - If the product comes from an external API → Find alternatives in both the internal database and the external API.  
     * - If the product comes from the internal database → Find alternatives in the internal database and external APIs.  
     * 
     * @param filters Object containing the following properties:
     *   - `productId` (string): The ID of the selected product (required).
     *   - `productSource` (string): The source of the product ("Internal", "OpenFoodFacts", etc.).
     *   - `currentRoute` (string): The current route to define the search logic ("searched-prod", "home", etc.).
     * @returns {Promise<any[]>} An array of alternative products.
     * @throws {NotFoundException} If the product ID is missing or the product is not found.
     * @throws {InternalServerErrorException} If an error occurs during the search.
     */
    async getFilteredProducts(filters: any): Promise<any[]> {
        const { productId, productSource, currentRoute } = filters;

        if (!productId) {
            throw new NotFoundException("Product ID is required.");
        }

        try {
            // Step 1: Retrieve the reference product
            const referenceProduct = await this.getReferenceProduct(productId, productSource);
            if (!referenceProduct) {
                throw new NotFoundException(`Product not found for ID ${productId}`);
            }

            console.log("🔎 Reference product:", referenceProduct.name);

            // Build common search criteria
            const searchCriteria = {
                productId: referenceProduct.code || referenceProduct.productId || null,
                productName: referenceProduct.product_name || referenceProduct.name,
                brand: referenceProduct.brand || referenceProduct.brands || null,
                category: referenceProduct.category || referenceProduct.categories,
                tags: referenceProduct.tags || referenceProduct._keywords || null,
                currentRoute: currentRoute,
                productSource: productSource,
            };

            let internalAlternatives: any[] = [];
            let externalAlternatives: any[] = [];

            // Step 2: Search alternatives based on the source
            if (productSource === "Internal") {
                console.log("🏠 Internal product: Searching similar products in DB + external APIs");
                internalAlternatives = await this.getInternalAlternatives(searchCriteria);
                externalAlternatives = await this.getExternalAlternatives(searchCriteria);

            } else {
                console.log("🌍 External product: Searching similar products in DB + external API");
                internalAlternatives = await this.getInternalAlternatives(searchCriteria);

                if (productSource === "OpenFoodFacts") {
                    externalAlternatives = await this.getOFFAlternatives(searchCriteria);
                }
            }

            // Step 3: Merge and return results
            const combinedResults = [...internalAlternatives, ...externalAlternatives];
            console.log(`📦 Total similar products found: ${combinedResults.length}`);
            return combinedResults;

        } catch (error) {
            console.error("❌ Error during alternative search:", error);
            throw new InternalServerErrorException("An error occurred while searching for alternatives.");
        }
    }

 /**
  * TODO
  * Some bugs :
  * Add the tags research in OFF
  */

    /**
     * @brief Retrieves the reference product from either the internal database or an external API.
     * 
     * @param productId The ID of the product to retrieve.
     * @param productSource The source of the product ("Internal" or "OpenFoodFacts").
     * @returns {Promise<any>} The retrieved product object.
     * @throws {NotFoundException} If the product source is unsupported.
     */
    private async getReferenceProduct(productId: string, productSource: string): Promise<any> {
        switch (productSource) {
            case "Internal":
                return await this.databaseService.getProductById(productId);
            case "OpenFoodFacts":
                return await this.openFoodFactsService.getProductByCode(productId);
            default:
                throw new NotFoundException(`Unsupported source: "${productSource}"`);
        }
    }

    /**
     * @brief Searches for alternative products in the internal database.
     * 
     * @param criteria Object containing:
     *   - `productName` (string): Product name for matching.
     *   - `brand` (string): Brand to filter by.
     *   - `category` (string): Category for filtering.
     *   - `currentRoute` (string): Route context affecting query logic.
     * @returns {Promise<any[]>} Array of products found in the internal database.
     */
    private async getInternalAlternatives(criteria: any): Promise<any[]> {
        console.log('GetInternalAlternatives');
        try {
            const filters = {
                productId: criteria.productId,
                name: criteria.productName,
                brand: criteria.brand,
                category: criteria.category,
                tags: criteria.tags || [],
                currentRoute: criteria.currentRoute,
                productSource: criteria.productSource,
            };
            console.log("🏠 Internal search with criteria:", filters);
            const results = await this.databaseService.getProductsWithFilters(filters);
            return results.map(product => ({ ...product, source: "Internal" }));
        } catch (error) {
            console.error("❌ Error during internal product search:", error);
            return [];
        }
    }

    /**
     * @brief Searches for alternative products across all available external APIs.
     * 
     * @param criteria Criteria for the search, including name, brand, and category.
     * @returns {Promise<any[]>} Array of products found in external APIs.
     */
    // TODO: implements some logic to choose which API use
    private async getExternalAlternatives(criteria: any): Promise<any[]> {
        const externalPromises: Promise<any[]>[] = [
            this.getOFFAlternatives(criteria), // Search in Open Food Facts
            // Add other APIs here if needed
        ];

        const results = await Promise.all(externalPromises);
        return results.flat();
    }

    /**
     * @brief Searches for alternative products in Open Food Facts.
     * 
     * @param criteria Object containing:
     *   - `productName` (string): Name of the product.
     *   - `brand` (string): Product brand.
     *   - `category` (string): Product category.
     * @returns {Promise<any[]>} Array of alternative products from Open Food Facts.
     */
    private async getOFFAlternatives(criteria: any): Promise<any[]> {
        try {
            console.log("🌍 Searching via Open Food Facts with criteria:", criteria);

            const results = await this.openFoodFactsService.searchSimilarProducts({
                productName: criteria.productName,
                brand: criteria.brand,
                category: criteria.category,
                tags: criteria.tags || [],
            });

            return results.map(product => ({
                id: product.code,
                name: product.product_name || 'Unknown name',
                brand: product.brands || 'Unknown brand',
                category: product.categories || 'Unknown category',
                tags: product._keywords || 'Unknown tags',
                ecoscore: product.ecoscore_grade || 'Unavailable',
                country: product.origin || 'Unavailable',
                manufacturing_places: product.manufacturing_places || 'Unavailable',
                image: product.image_front_url || null,
                source: "OpenFoodFacts",
            }));

        } catch (error) {
            console.error("❌ Error during Open Food Facts search:", error);
            return [];
        }
    }
}