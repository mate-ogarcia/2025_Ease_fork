/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService {
  constructor(private readonly databaseService: DatabaseService) { }

  async onApplicationBootstrap() {
    console.log('Démarrage de l’importation des produits...');
    await this.insertProductsToDatabase();
  }

  async insertProductsToDatabase() {
    const collection = this.databaseService.getCollection();

    try {
      // Détection de l'environnement et construction du chemin
      const basePath =
        process.env.BASE_PATH || path.resolve(__dirname, '..', '..');
      const filePath = path.join(basePath, 'src', 'products.json');

      // Chargement du fichier JSON
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const products = JSON.parse(fileData);

      console.log('Insertion des produits dans Couchbase...');
      for (const product of products) {
        try {
          await collection.upsert(product.id, product);
          console.log(`Produit ajouté ou mis à jour : ${product.id}`);
        } catch (error) {
          console.error(
            `Erreur lors de l'insertion du produit ${product.id} :`,
            error,
          );
        }
      }
      console.log('Tous les produits ont été traités.');
    } catch (error) {
      console.error(
        'Erreur lors de la lecture ou de l’insertion des produits :',
        error.message,
      );
    }
  }
}
