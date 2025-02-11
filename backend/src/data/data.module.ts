/**
 * @file data.module.ts
 * @brief Module for managing data-related operations.
 *
 * This module provides the necessary controllers and services
 * for handling data operations in the application.
 */

import { Module } from "@nestjs/common";
import { DataController } from "./data.controller";
import { DataService } from "./data.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
