/**
 * @file countries.service.ts
 * @brief Service for fetching and storing European country data.
 * 
 * This service retrieves a list of European countries from an external API
 * (`restcountries.com`) and stores it for optimized access. The data is loaded
 * once when the server starts and can be accessed via a getter.
 */

import { Injectable, OnModuleInit, InternalServerErrorException, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CountriesService implements OnModuleInit {
    private readonly logger = new Logger(CountriesService.name);
    private _europeanCountries: string[] = []; // List of European countries retrieved from the API.

    // Emergency list of European countries in case of API failure
    private readonly defaultEuropeanCountries: string[] = [
        "France", "Germany", "Italy", "Spain", "United Kingdom", "Portugal", "Netherlands",
        "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland",
        "Ireland", "Greece", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria",
        "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Luxembourg",
        "Malta", "Cyprus", "Iceland", "Andorra", "Monaco", "Liechtenstein", "San Marino",
        "Vatican City"
    ];

    constructor(private httpService: HttpService) { }

    /**
     * @brief Lifecycle hook executed when the module is initialized.
     * 
     * This function ensures that the list of European countries is fetched
     * when the server starts.
     */
    async onModuleInit() {
        try {
            await this.fetchEuropeanCountries();
            this.logger.log(`Successfully loaded ${this._europeanCountries.length} European countries`);
        } catch (error) {
            this.logger.warn(`Failed to fetch European countries from API, using default list of ${this.defaultEuropeanCountries.length} countries`);
            this._europeanCountries = [...this.defaultEuropeanCountries];
        }
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
            this.logger.log('Fetching European countries from external API...');

            // Fetch data from the API with a timeout of 5 seconds
            const response = await firstValueFrom(
                this.httpService.get<any[]>('https://restcountries.com/v3.1/region/europe', {
                    timeout: 5000
                })
            );

            // Extract country names and store them
            this._europeanCountries = response.data.map(country => country.name.common);
            this.logger.log(`Successfully fetched ${this._europeanCountries.length} European countries`);
        } catch (error) {
            this.logger.error("Error fetching European countries:", error);
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
