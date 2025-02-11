import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [],
  imports: [
    DatabaseModule,
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}
