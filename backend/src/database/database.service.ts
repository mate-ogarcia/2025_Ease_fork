/**
 * @file database.service.ts
 * @brief Service for handling database operations.
 *
 * This service provides functionalities to interact with the database,
 * including CRUD operations and connection management.
 */

// Other
import { Injectable, OnModuleInit, OnModuleDestroy, InternalServerErrorException } from "@nestjs/common";
import * as couchbase from "couchbase";
import * as fs from "fs";
// HTTP
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;
  private collection: couchbase.Collection;
  constructor(private readonly httpService: HttpService) { }

  /**
   * Initializes the Couchbase connection when the module starts.
   * Loads the SSL certificate and connects to the Couchbase Capella cluster.
   */
  async onModuleInit() {
    try {
      console.log("🔹 Waiting before connecting...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

      // Load the SSL root certificate
      const cert = fs.readFileSync(process.env.SSL_CERT_PATH).toString();

      console.log("🔹 Connecting to Couchbase Capella...");
      this.cluster = await couchbase.connect(process.env.DB_HOST, {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        configProfile: "wanDevelopment", // Required for WAN connections
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
   * Closes the connection to the Couchbase cluster when the module is destroyed.
   */
  async onModuleDestroy() {
    await this.cluster.close();
    console.log("🔹 Couchbase connection closed.");
  }

  /**
   * Retrieves the Couchbase bucket instance.
   * @returns {couchbase.Bucket} The initialized bucket object.
   * @throws {Error} If the bucket has not been initialized yet.
   */
  getBucket(): couchbase.Bucket {
    if (!this.bucket) {
      throw new Error("❌ Couchbase bucket is not initialized yet.");
    }
    return this.bucket;
  }

  /**
   * Retrieves the default collection from the Couchbase bucket.
   * @returns {Promise<couchbase.Collection>} The default collection.
   * @throws {Error} If the collection has not been initialized yet.
   */
  async getCollection(): Promise<couchbase.Collection> {
    if (!this.collection) {
      throw new Error("❌ Collection not initialized");
    }
    return this.collection;
  }

  /**
   * Executes a N1QL query to retrieve all data from the Couchbase bucket.
   * @returns {Promise<any[]>} A promise that resolves to an array of all documents.
   * @throws {Error} If the query execution fails.
   */
  async getAllData(): Promise<any[]> {
    const bucketName = process.env.BUCKET_NAME;

    try {
      console.log(`🔹 Executing N1QL query: SELECT * FROM \`${bucketName}\``);
      const query = `SELECT * FROM \`${bucketName}\``;
      const result = await this.cluster.query(query);
      return result.rows;
    } catch (error) {
      console.error("❌ Error while retrieving data:", error);
      return [];
    }
  }

  /**
   * Executes a Full Text Search (FTS) query on Couchbase Capella.
   * @param {string} searchQuery - The query string to search for.
   * @returns {Promise<any[]>} A promise that resolves to an array of search results.
   * @throws {Error} If the search query execution fails.
   */
  async searchQuery(searchQuery: string): Promise<any[]> {
    const _indexName = process.env.INDEX_NAME;
    searchQuery = searchQuery.toLowerCase(); // Normalize the query

    try {
      const prefixQuery = couchbase.SearchQuery.prefix(searchQuery); // Prefix search
      const matchQuery = couchbase.SearchQuery.match(searchQuery); // Natural language search

      // Combine prefix and match queries
      const combinedQuery = couchbase.SearchQuery.disjuncts(prefixQuery, matchQuery);

      const searchRes = await this.cluster.searchQuery(
        _indexName,
        combinedQuery,
        {
          fields: ["name", "description", "category", "tags"],
          highlight: { style: couchbase.HighlightStyle.HTML, fields: ["name", "description", "category", "tags"] }
        }
      );

      return searchRes.rows;
    } catch (error) {
      console.error("❌ Error during FTS query:", error);
      throw error;
    }
  }

  /**
   * Retrieves a specific product from Couchbase by its ID.
   * @param {string} productId - The ID of the product to retrieve.
   * @returns {Promise<any>} - A promise resolving with product details or `null` if not found.
   * @throws {Error} - If the query fails.
   */
  async getProductById(productId: string): Promise<any> {
    const bucketName = process.env.BUCKET_NAME;

    try {
      console.log(`🔹 Retrieving product with ID: ${productId}`);

      const query = `SELECT * FROM \`${bucketName}\` WHERE META().id = ?`;
      const options = { parameters: [productId] };

      const result = await this.cluster.query(query, options);

      if (result.rows.length > 0) {
        return result.rows[0][bucketName];
      } else {
        console.warn(`⚠️ Product with ID "${productId}" not found.`);
        return null;
      }
    } catch (error) {
      console.error("❌ Error retrieving product:", error);
      throw new Error("Error retrieving product.");
    }
  }


  /**
   * Retrieves alternative products based on search criteria from Couchbase.
   * @param {any} searchCriteria - Criteria to filter alternative products.
   * @returns {Promise<any[]>} - A promise resolving with an array of alternative products.
   * @throws {InternalServerErrorException} - If the query execution fails.
   */
  async getAlternativeProducts(searchCriteria: any): Promise<any[]> {
    const bucketName = process.env.BUCKET_NAME;

    try {
      if (Object.keys(searchCriteria).length === 0) {
        throw new Error("❌ searchCriteria is empty");
      }

      console.log(`🔹 Searching alternatives with criteria:`, searchCriteria);

      // Appel API pour récupérer la liste des pays européens
      const response = await this.httpService.axiosRef.get('https://restcountries.com/v3.1/region/europe');
      const europeanCountries = response.data.map(country => country.name.common);

      // Construction dynamique de la requête N1QL
      let query = `SELECT * FROM \`${bucketName}\` WHERE `;
      const queryConditions: string[] = [];
      const queryParams: any[] = [];

      // Ajout des conditions dynamiquement
      if (searchCriteria.category) {
        queryConditions.push("category = ?");
        queryParams.push(searchCriteria.category);
      }

      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
        queryConditions.push("ANY tag IN tags SATISFIES tag IN ? END");
        queryParams.push(searchCriteria.tags); // Vérifier si un tag correspond
      }

      if (searchCriteria.brand) {
        queryConditions.push("brand != ?");
        queryParams.push(searchCriteria.brand); // Exclure la même marque
      }

      // 🔹 Filtrer uniquement les produits européens
      queryConditions.push("origin IN ?");
      queryParams.push(europeanCountries); // Vérifier si l'origine est européenne

      // Finaliser la requête avec les conditions et limiter les résultats
      query += queryConditions.join(" AND ") + " LIMIT 10";

      console.log(`🔹 Executing N1QL query: ${query} with params:`, queryParams);

      // Exécution de la requête dans Couchbase
      const result = await this.cluster.query(query, { parameters: queryParams });

      return result.rows.map(row => row[bucketName]); // Extraire les données des produits
    } catch (error) {
      console.error("❌ Error retrieving alternative products (database.service):", error);
      throw new InternalServerErrorException("Error retrieving alternative products (database.service)");
    }
  }

}


