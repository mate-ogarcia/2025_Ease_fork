/**
 * @file co2Calculator.controller.ts
 * @brief Controller for handling CO2 calculation API endpoints.
 *
 * This controller provides endpoints to calculate CO2 impact for both internal and external products.
 */

import { Controller, Get, Param } from "@nestjs/common";
import { Co2CalculatorService } from "./co2Calculator.service";

@Controller("Co2Calculator")
export class Co2CalculatorController {

    constructor(private co2CalculatorService: Co2CalculatorService) {}
    @Get('/co2/:productId/:userLocation/:category?/:origin?')
    async getCO2Impact(
        @Param('productId') productId: string,
        @Param('userLocation') userLocation: string,
        @Param('category') category?: string,
        @Param('origin') origin?: string
    ) {
        console.log('controller:', productId, userLocation, category, origin);
        const co2 = await this.co2CalculatorService.calculateCO2(
            productId,
            userLocation,
            category,
            origin
        );
        return { co2 };
    }
    
}
