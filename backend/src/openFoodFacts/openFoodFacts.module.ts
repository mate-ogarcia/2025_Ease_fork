import { Module } from "@nestjs/common";
import { openFoodFactsService } from "./openFoodFacts.service";
import { openFoodFactsController } from "./openFoodFacts.controller";

@Module({
  providers: [openFoodFactsService],
  imports: [],
  exports: [openFoodFactsService],
  controllers: [openFoodFactsController]
})
export class DatabaseModule {}
