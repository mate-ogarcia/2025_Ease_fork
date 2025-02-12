import { Injectable, OnModuleInit, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ProductsService implements OnModuleInit {
    constructor(private readonly databaseService: DatabaseService) {}

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
     * @brief Retrieves alternative European products.
     */
    // TODO
    async getAlternativeProducts(productId: string) {
        // try {
        //     const selectedProduct = await this.databaseService.getProductById(productId);
        //     if (!selectedProduct) {
        //         throw new NotFoundException(`⚠️ Product with ID "${productId}" not found.`);
        //     }

        //     // Trouver des produits alternatifs
        //     const alternatives = await this.databaseService.findProducts({
        //         category: selectedProduct.category,
        //         origin: { $ne: 'USA' } // Exclure les produits non européens
        //     });

        //     return alternatives;
        // } catch (error) {
        //     console.error("❌ Error retrieving alternative products:", error);
        //     throw new InternalServerErrorException("Error retrieving alternative products.");
        // }
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
            return await this.databaseService.getAllData();
        } catch (error) {
            console.error("❌ Error retrieving all products:", error);
            throw new InternalServerErrorException("Error retrieving all products.");
        }
    }
}
