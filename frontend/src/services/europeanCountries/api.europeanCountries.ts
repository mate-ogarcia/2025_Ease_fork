import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * @class ApiEuropeanCountries
 * @description
 * This service provides functionality to fetch and check European countries. It fetches a list
 * of European countries from an external API and checks if a product's origin is from a European country.
 */
@Injectable({
    providedIn: 'root',
})
export class ApiEuropeanCountries {

    // List of European countries fetched from the external API.
    private _europeanCountries: string[] = [];

    // Flag indicating if the product is from a European country.
    private _isEuropean: boolean = true;

    /**
     * @brief Constructor initializes the HTTP client for making API requests.
     * 
     * @param http HttpClient instance for making API requests to external sources.
     */
    constructor(private http: HttpClient) { }

    /**
     * @brief Fetches the list of European countries from an external API.
     * 
     * This function makes a request to the `restcountries.com` API to get a list of European countries,
     * and stores the country names in the `_europeanCountries` array. The list is logged to the console once 
     * successfully fetched.
     * 
     * @async
     * @returns {Promise<void>} A promise that resolves when the countries are fetched and stored.
     * @throws {Error} Will throw an error if the API request fails.
     */
    async fetchEuropeanCountries() {
        try {
            // Fetch data from the API
            const response = await firstValueFrom(
                this.http.get<any[]>('https://restcountries.com/v3.1/region/europe')
            );

            // Map the country names and store them
            this._europeanCountries = response.map(country => country.name.common);
        } catch (error) {
            // Catch any errors and log them
            console.error("❌ Error fetching European countries:", error);
        }
    }

    /**
     * @brief Checks if the product's origin is in the list of European countries.
     * 
     * This function checks if the provided origin country is in the list of European countries.
     * It returns `true` if the product's origin is from a European country, otherwise returns `false`.
     * 
     * @param origin The country of origin of the product.
     * @returns {boolean} `true` if the origin is a European country, otherwise `false`.
     */
    checkIfEuropean(origin: string): boolean {
        if (!origin) {
            return false; // If no origin is provided, return false
        }
        // Return true if the origin is found in the list of European countries, otherwise false
        return this._europeanCountries.includes(origin);
    }


    /**
     * @brief Allow to access to the private variable '_europeanCountries'
     */
    get europeanCountries(): string[] {
        return this._europeanCountries;
    }
}
