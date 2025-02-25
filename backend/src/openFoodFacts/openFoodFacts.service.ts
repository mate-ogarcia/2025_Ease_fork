import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from "rxjs";

@Injectable()
export class OpenFoodFactsService {
    constructor(private readonly httpService: HttpService) {}  // Injection du HttpService

    async searchProductsByName(name: string, page: number = 1, pageSize: number = 20): Promise<any> {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&page=${page}&page_size=${pageSize}&search_simple=1&action=process&json=1`;
      try {
        const response = await firstValueFrom(this.httpService.get(url));
        console.log('Réponse de OpenFoodFacts :', response.data);
        return response.data;
      } catch (error) {
        throw new HttpException(
          'Erreur lors de la recherche des produits dans OpenFoodFacts',
          HttpStatus.BAD_GATEWAY,
        );
      }
    }
}
