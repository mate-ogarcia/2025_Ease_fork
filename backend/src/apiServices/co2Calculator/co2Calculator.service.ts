/**
 * @file co2Calculator.service.ts
 * @brief Service for calculating CO2 impact of product transportation.
 *
 * This service calculates the CO2 impact based on product origin, destination,
 * and transportation method.
 */
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class Co2CalculatorService {
    constructor(
        private databaseService: DatabaseService
    ) {}

    async calculateCO2(
        productId: string,
        userLocation: string,
        category?: string,
        origin?: string
    ): Promise<number> {
        console.log('param:', productId, userLocation, category, origin);

        // If origin and category are provided, it's an external product
        // Otherwise, fetch the product data from database using productId
        let productOrigin = origin;
        let productCategory = category;

        if (!origin || !category) {
            const product = await this.databaseService.getProductById(productId);
            if (!product) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            productOrigin = productOrigin || product.origin;
            productCategory = productCategory || product.category;
        }

        const distance = await this.getDistanceInKm(productOrigin, userLocation);
        const transport = this.estimateTransportType(productOrigin, productCategory);
        const coefficient = this.getCO2Coefficient(transport);
        return distance * coefficient;
    }

    private async getDistanceInKm(
        origin: string,
        destination: string
    ): Promise<number> {
        // TODO: Implement actual distance calculation
        return 1000; // Placeholder value
    }

    private estimateTransportType(origin: string, category: string): string {
        // Implement logic based on your criteria
        if (origin.includes("China") && category === "High-tech") return "plane";
        // ... other rules
        return "ship"; // fallback
    }

    private getCO2Coefficient(transport: string): number {
        const coeffs = {
            plane: 0.55,
            truck: 0.12,
            ship: 0.017,
        };
        return coeffs[transport] || 0.1;
    }
}
