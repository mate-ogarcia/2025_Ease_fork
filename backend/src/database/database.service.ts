import { Injectable, OnModuleInit } from '@nestjs/common';
import * as couchbase from 'couchbase';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private cluster!: couchbase.Cluster;
  private bucket!: couchbase.Bucket;

  async onModuleInit() {
    await this.connectToDatabase();
  }

  /**
   * Permet la connection à la DB
   * 
   * /!\ l'IP doit etre celle de la machine qui héberge la DB
   */
  private async connectToDatabase() {
    try {
      console.log('🟡 Connexion à Couchbase en cours...');
      this.cluster = await couchbase.connect('couchbase://172.21.128.1', {
        username: 'user1',
        password: 'password',
      });

      this.bucket = this.cluster.bucket('ProductsBDD');
      console.log('✅ Connexion réussie à Couchbase !');
    } catch (error) {
      console.error('❌ Erreur de connexion à Couchbase :', error);
      throw new Error('Impossible de se connecter à Couchbase');
    }
  }

  getBucket() {
    if (!this.bucket) {
      throw new Error('Le bucket Couchbase n\'est pas encore initialisé.');
    }
    return this.bucket;
  }

  getCollection() {
    if (!this.bucket) {
      throw new Error('Le bucket Couchbase n\'est pas encore initialisé.');
    }
    return this.bucket.defaultCollection();
  }

  /**
   * @brief Récupère toutes les données de la base de données Couchbase.
   * 
   * Cette méthode exécute une requête N1QL pour récupérer les
   * entrées du bucket `my_bucket`. Elle gère également les erreurs éventuelles 
   * en renvoyant un tableau vide en cas d'échec.
   * 
   * @returns {Promise<any[]>} Une promesse contenant un tableau avec les données récupérées.
   */
  async getAllData(): Promise<any[]> {
    try {
      const query = 'SELECT * FROM `ProductsBDD`'; // Requête N1QL
      const result = await this.cluster.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return [];
    }
  }

}
