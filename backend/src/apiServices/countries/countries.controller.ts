/**
 * @file countries.controller.ts
 * @brief Controller for handling country-related API endpoints.
 * 
 * This controller provides an endpoint to retrieve the list of European countries.
 * It interacts with the `CountriesService` to fetch and return the data.
 */

import {
  Controller,
  Get,
} from "@nestjs/common";
import { CountriesService } from "./countries.service";

@Controller("apiCountries")
export class CountriesController {

  constructor(
    private CountriesService: CountriesService // Service handling country data
  ) {}

  /**
   * @brief Retrieves the list of European countries.
   * 
   * @return string[] A list of European country names.
   */
  @Get()
  getCountries(): string[] {
    return this.CountriesService.europeanCountries;
  }
}
