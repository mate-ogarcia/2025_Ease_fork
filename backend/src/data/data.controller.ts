import { Controller, Post } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('import-products')
  async importProducts() {
    await this.dataService.insertProductsToDatabase();
    return { message: 'Produits ajoutés à la base de données avec succès!' };
  }
}
