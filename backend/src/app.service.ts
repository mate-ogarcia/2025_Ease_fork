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
    const rawData = await this.dbService.getAllData(); // 🔹 Récupération brute depuis la base
    console.log("🔹 Données brutes récupérées :", rawData);

    // TODO comme l'import dans la bdd import le json en brut les transformation ne se font pas
    const transformedData = rawData.map(item => ({
      id: item.id || null, 
      name: item.name ? item.name.toUpperCase() : "UNKNOWN", // Convertir en majuscules
      timestamp: new Date().toISOString() // Ajouter un timestamp
    }));

    console.log("✅ Données transformées :", transformedData);
    return transformedData;
  }
}
