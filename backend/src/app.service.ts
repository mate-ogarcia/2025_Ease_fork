import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Fonction qui renvoie un message "Hello World!" (test des routes)
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Récupère les données brutes de la base Couchbase et applique une transformation.
   * Transformation : 
   * - Convertir `name` en majuscules
   * - Ajouter un champ `timestamp` pour chaque entrée
   *
   * @returns {Promise<any[]>} Une promesse contenant les données transformées.
   */
  async getData(): Promise<any[]> {
    const rawData = await this.dbService.getAllData();
  
    const transformedData = rawData.map(item => {
      // Accéder aux données imbriquées
      const product = item.ProductsBDD; // Change "ProductsBDD" selon ta structure réelle
  
      return {
        id: product?.id || null,
        name: product?.name ? product.name.toUpperCase() : "UNKNOWN",
        timestamp: new Date().toISOString(),
      };
    });
  
    return transformedData;
  }
  
}
