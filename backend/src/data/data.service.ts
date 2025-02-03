import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs'; // Importer le module fs pour lire les fichiers
import * as path from 'path'; // Utilisé pour générer des chemins de fichiers

@Injectable()
export class DataService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Méthode pour insérer les produits dans Couchbase
  async insertProductsToDatabase() {
    const bucket = this.databaseService.getBucket();
    const collection = bucket.defaultCollection();

    try {
      // Lire le fichier JSON de manière synchrone
      const filePath = path.join(__dirname, 'products.json'); // Obtenir le chemin absolu du fichier
      const fileData = fs.readFileSync(filePath, 'utf-8'); // Lire le fichier
      const products = JSON.parse(fileData); // Parse les données JSON du fichier

      // Insérer chaque produit dans la base de données
      for (const product of products) {
        await collection.upsert(product.id, product); // Utilisation de 'upsert' pour ajouter ou mettre à jour
        console.log(`Produit ${product.name} ajouté avec succès!`);
      }
    } catch (error) {
      console.error("Erreur lors de l'insertion des produits:", error);
    }
  }
}
