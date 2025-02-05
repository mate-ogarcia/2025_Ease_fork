import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Fonction qui print Hello World sur le back (test des routes)
   * @returns un print de Hello World
   */
  @Get() // Route : http://localhost:3000/
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * @brief Récupère les données de la base Couchbase.
   * 
   * Cette méthode intercepte une requête HTTP GET sur l'endpoint `/data` 
   * et retourne les données récupérées via le service `DatabaseService`.
   * 
   * @returns {Promise<any[]>} Une promesse contenant les données de la base.
   */
  @Get('data') // Route : http://localhost:3000/data
  async getData(): Promise<any[]> {
    return await this.dbService.getAllData();
  }

}
