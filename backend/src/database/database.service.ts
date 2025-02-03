import { Injectable, OnModuleInit } from '@nestjs/common'; // Importation des décorateurs nécessaires
import * as couchbase from 'couchbase'; // Importation du client Couchbase

/**
 * Service responsable de la connexion à Couchbase et de la gestion des opérations de base.
 */
@Injectable()
export class DatabaseService implements OnModuleInit {
  // Variables pour stocker l'instance du cluster et du bucket Couchbase
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;

  /**
   * Méthode appelée automatiquement lorsque le module contenant ce service est initialisé.
   * Elle est utilisée pour établir la connexion avec Couchbase.
   */
  async onModuleInit() {
    if (!this.cluster) {
      await this.connectToDatabase();
    }
  }

  /**
   * Cette méthode établit la connexion au cluster Couchbase.
   * Elle configure également le bucket qui sera utilisé pour stocker les données.
   */
  private async connectToDatabase() {
    try {
      this.cluster = await couchbase.connect('couchbase://192.168.1.98', {
        username: 'admin', // Nom d'utilisateur pour l'authentification
        password: 'adminPass', // Mot de passe pour l'authentification
      });

      this.bucket = this.cluster.bucket('my_first_bucket'); // Remplacez par le nom de votre bucket
      console.log('✅ Connexion réussie à Couchbase !');
    } catch (error) {
      console.error('❌ Erreur de connexion à Couchbase :', error);
    }
  }

  /**
   * Renvoie l'instance du bucket connecté.
   * Cette méthode est utilisée pour effectuer des opérations sur le bucket.
   * @returns L'instance du bucket Couchbase
   */
  getBucket() {
    if (!this.bucket) {
      throw new Error(
        'Bucket non initialisé. Vérifiez la connexion Couchbase.',
      );
    }
    return this.bucket;
  }

  /**
   * Renvoie la collection par défaut associée au bucket.
   * Une collection est un conteneur logique à l'intérieur du bucket pour organiser les données.
   * @returns La collection par défaut du bucket
   */
  getCollection() {
    return this.bucket.defaultCollection(); // Utilise la collection par défaut pour le stockage des documents
  }
}
