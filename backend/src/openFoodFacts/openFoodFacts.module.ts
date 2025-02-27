import { Module } from "@nestjs/common";
import { HttpModule } from '@nestjs/axios';
import { OpenFoodFactsService } from "./openFoodFacts.service";
import { OpenFoodFactsController } from "./openFoodFacts.controller";

@Module({
  providers: [OpenFoodFactsService],
  imports: [HttpModule],
  controllers: [OpenFoodFactsController],
  exports: [OpenFoodFactsService],
})
export class OpenFoodFactsModule {}
