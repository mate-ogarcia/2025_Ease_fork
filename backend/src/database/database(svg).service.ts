import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import * as couchbase from "couchbase";
import * as fs from "fs";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;
  private collection: couchbase.Collection;

  /**
   * Initialisation du module.
   * Connecte au cluster Couchbase Capella.
   */
  async onModuleInit() {
    try {
      // Charger le certificat racine pour la connexion sécurisée
      const cert = fs.readFileSync(process.env.SSL_CERT_PATH).toString();

      console.log("🟡 Connecting to Couchbase Capella...");
      this.cluster = await couchbase.connect(process.env.DB_HOST, {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        configProfile: "wanDevelopment", // Configuration pour les connexions WAN
      });

      this.bucket = this.cluster.bucket(process.env.BUCKET_NAME);
      this.collection = this.bucket.defaultCollection();
      console.log("✅ Successfully connected to Couchbase Capella!");
    } catch (error) {
      console.error("❌ Connection error to Couchbase Capella:", error.message);
      throw new Error("Unable to connect to Couchbase Capella");
    }
  }

  /**
   * Retourne la bucket Couchbase.
   */
  getBucket(): couchbase.Bucket {
    if (!this.bucket) {
      throw new Error("Couchbase bucket is not initialized yet.");
    }
    return this.bucket;
  }

  /**
   * Retourne la collection par défaut du bucket.
   */
  async getCollection(): Promise<couchbase.Collection> {
    if (!this.collection) {
      throw new Error("Collection not initialized");
    }
    return this.collection;
  }

  /**
   * Exécute une requête N1QL pour récupérer toutes les données du bucket.
   */
  async getAllData(): Promise<any[]> {
    const bucketName = process.env.BUCKET_NAME;

    try {
      const query = `SELECT * FROM \`${bucketName}\``; // Requête N1QL
      const result = await this.cluster.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error while retrieving data:", error);
      return [];
    }
  }

  /**
   * Exécute une requête Full Text Search (FTS) sur Couchbase Capella.
   */
  async searchQuery(searchQuery: string): Promise<any[]> {
    const indexName = process.env.INDEX_NAME; // Assurez-vous que l'index est configuré correctement

    try {
      const searchRes = await this.cluster.searchQuery(
        indexName,
        couchbase.SearchQuery.queryString(searchQuery), // Requête FTS
        {
          fields: ["*"], // Retourner tous les champs
          highlight: {
            style: couchbase.HighlightStyle.HTML,
            fields: ["name", "description"],
          }, // Surligner certains champs
        }
      );

      return searchRes.rows;
    } catch (error) {
      console.error("Error during FTS query:", error);
      throw error;
    }
  }

  /**
   * Nettoie la connexion au cluster Couchbase lors de la destruction du module.
   */
  async onModuleDestroy() {
    await this.cluster.close();
    console.log("Couchbase connection closed");
  }
}
