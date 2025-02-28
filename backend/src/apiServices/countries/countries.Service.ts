/**
 * @file countries.service.ts
 * @brief Service for fetching and storing European country data.
 * 
 * This service retrieves a list of European countries from an external API
 * (`restcountries.com`) and stores it for optimized access. The data is loaded
 * once when the server starts and can be accessed via a getter.
 */

import { Injectable, OnModuleInit, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CountriesService implements OnModuleInit {
    private _europeanCountries: string[] = []; // List of European countries retrieved from the API.

    constructor(private httpService: HttpService) { }

    /**
     * @brief Lifecycle hook executed when the module is initialized.
     * 
     * This function ensures that the list of European countries is fetched
     * when the server starts.
     */
    async onModuleInit() {
        await this.fetchEuropeanCountries();
    }

    /**
     * @brief Fetches the list of European countries from the `restcountries.com` API.
     * 
     * This function retrieves the data from the external API, extracts country names,
     * and stores them in the `_europeanCountries` array.
     * 
     * @throws InternalServerErrorException If there is an error while fetching the data.
     */
    async fetchEuropeanCountries() {
        try {
            // Fetch data from the API
            const response = await firstValueFrom(
                this.httpService.get<any[]>('https://restcountries.com/v3.1/region/europe')
            );

            // Extract country names and store them
            this._europeanCountries = response.data.map(country => country.name.common);
        } catch (error) {
            console.error("❌ Error fetching European countries:", error);
            throw new InternalServerErrorException("Unable to fetch European countries");
        }
    }

    /**
     * @brief Retrieves the list of European countries.
     * 
     * @return string[] List of European country names.
     */
    get europeanCountries(): string[] {
        return this._europeanCountries;
    }
}
