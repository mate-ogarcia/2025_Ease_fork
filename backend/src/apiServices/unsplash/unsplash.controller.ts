/**
 * @file unsplash.controller.ts
 * @brief Controller for handling Unsplash image search requests.
 *
 * This controller provides an endpoint to search for images on Unsplash
 * using the UnsplashService.
 */

import {
    Controller,
    Get,
    Query,
  } from "@nestjs/common";
  import { UnsplashService } from "./unsplash.service";
  
  /**
   * @class UnsplashController
   * @brief Handles Unsplash image search requests.
   *
   * This controller provides an endpoint to query the Unsplash API for images.
   */
  @Controller("unsplash")
  export class UnsplashController {
  
    /**
     * @brief Constructor that injects the UnsplashService.
     * @param UnsplashService The service handling requests to Unsplash.
     */
    constructor(
      private UnsplashService: UnsplashService
    ) {}
  
    /**
     * @brief Searches for images on Unsplash based on a query string.
     *
     * @param query The search term used to find images.
     * @returns An object containing the image URL or null if not found.
     */
    @Get("search")
    async search(@Query("query") query: string): Promise<{ imageUrl: string | null }> {
      const imageUrl = await this.UnsplashService.searchPhotos(query);
      return { imageUrl };
    }
  }