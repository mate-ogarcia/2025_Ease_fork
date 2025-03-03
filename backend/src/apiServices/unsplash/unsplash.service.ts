/**
 * @file unsplash.service.ts
 * @brief Service for fetching images from Unsplash.
 *
 * This service provides functionality to query the Unsplash API and retrieve
 * images based on a search query.
 */

import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * @class UnsplashService
 * @brief Handles communication with the Unsplash API.
 *
 * This service allows querying Unsplash for images and retrieving image URLs.
 */
@Injectable()
export class UnsplashService {    
    private readonly UNSPLASH_URL = "https://api.unsplash.com"; // Base URL for the Unsplash API.
    private readonly UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // API access key retrieved from environment variables.
    
    /**
     * @brief Constructor that injects the HttpService.
     * @param httpService Service to make HTTP requests.
     */
    constructor(
        private readonly httpService: HttpService,
    ) {}
    
    /**
     * @brief Searches for images on Unsplash based on a query string.
     *
     * @param query The search term used to find images.
     * @returns The URL of the first matching image, or null if no results.
     */
    async searchPhotos(query: string): Promise<string | null> {
      try {
        const response = await this.httpService.axiosRef.get(
          `${this.UNSPLASH_URL}/search/photos`,
          {
            params: { query },
            headers: {
              Authorization: `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
            },
          }
        );
  
        if (response.data.results?.length > 0) {
          const urls = response.data.results[0].urls;
          return urls.raw
            ? `${urls.raw}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`
            : urls.small ?? null;
        }
  
        return null;
      } catch (error) {
        console.error(`❌ Erreur lors de la récupération d'image Unsplash: ${error.message}`);
        return null;
      }
    }
}
