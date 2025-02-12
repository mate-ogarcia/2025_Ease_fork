import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [ProductsService],
  imports: [
    DatabaseModule,
  ],
  controllers: [ProductsController],
  exports: [ProductsService]
})
export class ProductsModule {}
