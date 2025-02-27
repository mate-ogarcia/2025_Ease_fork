import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { DatabaseModule } from "src/database/database.module";
import { OpenFoodFactsModule } from "src/openFoodFacts/openFoodFacts.module";
@Module({
  providers: [ProductsService],
  imports: [
    DatabaseModule, 
    OpenFoodFactsModule
  ],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
