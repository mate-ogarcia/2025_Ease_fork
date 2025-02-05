import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Fonction qui renvoie "Hello World!" pour tester la route `/`
   * @returns Un message "Hello World!"
   */
  @Get() // Route : http://localhost:3000/
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * @brief Récupère et transforme les données de la base Couchbase via AppService.
   * 
   * Cette méthode intercepte une requête HTTP GET sur l'endpoint `/data` 
   * et retourne les données récupérées et transformées via le service `AppService`.
   * 
   * @returns {Promise<any[]>} Une promesse contenant les données transformées.
   */
  @Get('data') // Route : http://localhost:3000/data
  async getData(): Promise<any[]> {
    return await this.appService.getData(); 
  }
  
  /**
   * @brief Reçoit les données envoyées par le frontend et les affiche dans la console du backend.
   * 
   * Cette méthode intercepte une requête HTTP POST sur l'endpoint `/data` 
   * et retourne un message de confirmation avec les données reçues.
   * 
   * @param {any} data - Les données envoyées par le frontend.
   * @returns {Promise<{message: string, receivedData: any}>} Un objet contenant un message de confirmation 
   * et les données reçues.
  */
  @Post('data') // Route POST pour recevoir les données
  async receiveData(@Body() data: any): Promise<any> {
    console.log("✅  Données reçues du frontend (backend) :", data);
    return { message: "✅ Données enregistrées avec succès ! (backend)", receivedData: data };
  }
}
