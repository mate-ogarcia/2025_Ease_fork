/**
 * @file countries.module.ts
 * @brief Module for handling country-related functionality.
 * 
 * This module is responsible for managing European country data. 
 * It provides a service for fetching countries from an external API and a 
 * controller for exposing this data through API endpoints.
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";

@Module({
  providers: [CountriesService],
  imports: [
    HttpModule
  ],
  controllers: [CountriesController],
  exports: [CountriesService],
})
export class CountriesModule {}
