import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly dbService: DatabaseService) {}

  
  /**
   * @brief Récupère les données de la base Couchbase.
   * 
   * Cette méthode intercepte une requête HTTP GET sur l'endpoint `/data` 
   * et retourne les données récupérées via le service `DatabaseService`.
   * 
   * @returns {Promise<any[]>} Une promesse contenant les données de la base.
   */
  @Get()  // /!\ dans le Get() si on mets qlq chose dans la () alors ce sera cobsidéré comme une 
          // nouvelle route il faudra pour y accéder : localhost:3000/<ce qu'il y a das le GET(...)>
  async getHello(): Promise<any> {
    const data = await this.dbService.getAllData();
    return {
      message: "Hello World!",
      data: data
    };
  }
}
