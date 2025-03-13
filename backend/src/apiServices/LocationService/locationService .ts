import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

/**
 * @class LocationService
 * @brief Service responsible for fetching user location based on IP.
 */
@Injectable()
export class LocationService {
    private locationApiUrl = "http://ip-api.com/json";

    /**
     * @brief Constructor for LocationService.
     * @param httpService Service for making HTTP requests.
     */
    constructor(private readonly httpService: HttpService) {}

    /**
     * @brief Fetches location data based on the user's IP address.
     * @returns {Promise<any>} A promise resolving to the location data.
     * @throws {Error} If an error occurs while fetching location data.
     */
    async getLocation(): Promise<any> {
        try {
            const response = await firstValueFrom(this.httpService.get(this.locationApiUrl));
            return response.data;
        } catch (error) {
            throw new Error("Error retrieving location data");
        }
    }
}
