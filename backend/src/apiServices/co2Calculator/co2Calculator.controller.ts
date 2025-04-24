/**
 * @file co2Calculator.controller.ts
 * @brief Controller for handling CO2 calculation API endpoints.
 *
 * This controller provides endpoints to calculate CO2 impact for both internal and external products.
 */

import { Controller, Get, Param } from "@nestjs/common";
import { Co2CalculatorService, CO2Result } from "./co2Calculator.service";

@Controller("Co2Calculator")
export class Co2CalculatorController {
  constructor(private co2CalculatorService: Co2CalculatorService) {}

  /**
   * @brief Calculates the CO2 impact for a product based on its origin, destination, and category.
   * @param productId The ID of the product.
   * @param userLocation The user's location.
   * @param category The category of the product.
   * @param origin The origin of the product.
   * @returns A promise that resolves to the CO2 impact result.
   */
  @Get("/co2/:productId/:userLocation/:category?/:origin?")
  async getCO2Impact(
    @Param("productId") productId: string,
    @Param("userLocation") userLocation: string,
    @Param("category") category?: string,
    @Param("origin") origin?: string
  ): Promise<{ co2: CO2Result }> {
    console.log("CO2 Calculation request:", {
      productId,
      userLocation,
      category,
      origin,
    });

    // If category and origin are provided, it's an external product
    // Otherwise, it's an internal product and we'll fetch its details
    const co2 = await this.co2CalculatorService.calculateCO2(
      productId,
      userLocation,
      category,
      origin
    );

    return { co2 };
  }
}
