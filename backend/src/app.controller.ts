import { Controller, Get } from '@nestjs/common';
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
   * Récupère et transforme les données de la base Couchbase via AppService.
   * 
   * @returns {Promise<any[]>} Une promesse contenant les données transformées.
   */
  @Get('data') // Route : http://localhost:3000/data
  async getData(): Promise<any[]> {
    return await this.appService.getData(); // ✅ Maintenant, `getData()` est dans `AppService`
  }
}
