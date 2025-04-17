/**
 * @file comments.module.ts
 * @brief Module for managing comment-related components.
 * 
 * This module registers the `CommentsService` and `CommentsController`,
 * and imports required dependencies such as `DatabaseModule` and `OpenFoodFactsModule`.
 */

import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { DatabaseModule } from "src/database/database.module";
import { OpenFoodFactsModule } from "src/apiServices/openFoodFacts/openFoodFacts.module";

/**
 * @module CommentsModule
 * @brief NestJS module for handling comment-related operations.
 */
@Module({
  providers: [CommentsService],
  imports: [
    DatabaseModule, 
    OpenFoodFactsModule
  ],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
