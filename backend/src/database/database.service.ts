/**
 * @file database.service.ts
 * @brief Service for handling database operations.
 *
 * This service provides functionalities to interact with the database,
 * including CRUD operations and connection management.
 */

// Other
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import * as couchbase from "couchbase";
import * as fs from "fs";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;
  private collection: couchbase.Collection;

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
}
