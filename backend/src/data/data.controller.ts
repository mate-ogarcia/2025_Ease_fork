import { Controller, Post } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('import-products')
  async importProducts() {
    return this.dataService.insertProductsToDatabase();
  }
}
