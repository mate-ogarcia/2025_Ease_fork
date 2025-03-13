import { Controller, Get } from "@nestjs/common";
import { LocationService } from "./locationService ";
/**
 * @class LocationController
 * @brief Controller responsible for handling location-related requests.
 */
@Controller("location")
export class LocationController {
    /**
     * @brief Constructor for LocationController.
     * @param locationService The service handling location data retrieval.
     */
    constructor(private readonly locationService: LocationService) {}

    /**
     * @brief Retrieves location data.
     * @returns {Promise<any>} The location data fetched from the service.
     */
    @Get()
    async getLocation() {
        return await this.locationService.getLocation();
    }
}
