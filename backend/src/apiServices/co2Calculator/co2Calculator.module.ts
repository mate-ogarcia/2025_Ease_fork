/**
 * @file countries.module.ts
 * @brief Module for handling country-related functionality.
 * 
 * This module is responsible for managing European country data. 
 * It provides a service for fetching countries from an external API and a 
 * controller for exposing this data through API endpoints.
 */

import { Module } from '@nestjs/common';
import { Co2CalculatorController } from './co2Calculator.controller';
import { Co2CalculatorService } from './co2Calculator.service';
import { GeocodingService } from './geocoding.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [Co2CalculatorController],
  providers: [Co2CalculatorService, GeocodingService],
  exports: [Co2CalculatorService]
})
export class Co2CalculatorModule {}
