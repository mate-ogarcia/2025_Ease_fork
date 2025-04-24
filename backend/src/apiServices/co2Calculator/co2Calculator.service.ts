/**
 * @file co2Calculator.service.ts
 * @brief Service for calculating CO2 impact of product transportation.
 *
 * This service calculates the CO2 impact based on product origin, destination,
 * and transportation method.
 */
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { GeocodingService } from "./geocoding.service";

/**
 * @brief Interface for the CO2 impact result.
 * @param distance The distance in kilometers.
 * @param co2Impact The CO2 impact in kilograms.
 * @param transportType The transport type.
 */
export interface CO2Result {
  distance: number;
  co2Impact: number;
  transportType: string;
}
@Injectable()
export class Co2CalculatorService {
  constructor(
    private databaseService: DatabaseService,
    private geocodingService: GeocodingService
  ) {}

  /**
   * Calculates the CO2 impact for a product based on its origin, destination, and category.
   * @param productId The ID of the product.
   * @param userLocation The user's location.
   * @param category The category of the product.
   * @param origin The origin of the product.
   * @returns A promise that resolves to the CO2 impact result.
   */
  async calculateCO2(
    productId: string,
    userLocation: string,
    category?: string,
    origin?: string
  ): Promise<CO2Result> {
    // Input validation
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      throw new Error('Invalid productId: must be a non-empty string');
    }
    if (!userLocation || typeof userLocation !== 'string' || userLocation.trim() === '') {
      throw new Error('Invalid userLocation: must be a non-empty string');
    }

    // If category and origin are provided, it's an external product
    // Otherwise, fetch the product data from database using productId
    let productOrigin = origin;
    let productCategory = category;

    // Check if origin or category are actually undefined or empty strings
    if (origin === 'undefined' || !origin || category === 'undefined' || !category) {
      try {
        const product = await this.databaseService.getProductById(productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }
        productOrigin = product.origin;
        productCategory = product.category;
      } catch (error) {
        console.error("Error fetching product details:", error);
        throw new Error(`Failed to fetch product details for CO2 calculation: ${error.message}`);
      }
    }

    // Validate product origin and category
    if (!productOrigin || typeof productOrigin !== 'string' || productOrigin.trim() === '') {
      throw new Error('Invalid product origin: must be a non-empty string');
    }
    if (!productCategory || typeof productCategory !== 'string' || productCategory.trim() === '') {
      throw new Error('Invalid product category: must be a non-empty string');
    }

    try {
      // Get coordinates for both locations
      const originCoords = await this.geocodingService.getCoordinates(productOrigin);
      const destCoords = await this.geocodingService.getCoordinates(userLocation);

      // Calculate distance and get CO2 impact
      const result = this.geocodingService.calculateDistance(
        originCoords,
        destCoords,
        productOrigin
      );

      return result;
    } catch (error) {
      console.error("Error in CO2 calculation:", error);
      throw new Error(`Failed to calculate CO2 impact: ${error.message}`);
    }
  }
}
