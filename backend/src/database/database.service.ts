/**
 * @file database.service.ts
 * @brief Service for handling database operations.
 *
 * This service provides functionalities to interact with Couchbase,
 * including CRUD operations, connection management, and full-text search.
 */

// Dependencies
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from "@nestjs/common";
import * as couchbase from "couchbase";
import * as fs from "fs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: couchbase.Cluster;
  private buckets: Record<string, couchbase.Bucket> = {}; // Stores multiple buckets dynamically

  constructor(private readonly httpService: HttpService) {}

  /**
   * @brief Initializes the Couchbase connection when the module starts.
   * It dynamically loads multiple buckets for handling data.
   * @throws {Error} If the connection to Couchbase fails.
   */
  async onModuleInit() {
    try {
      console.log("🔹 Connecting to Couchbase Capella...");
      this.cluster = await couchbase.connect(process.env.DB_HOST, {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        configProfile: "wanDevelopment",
      });

      // Dynamically initializing buckets (UsersBDD & ProductsBDD)
      const bucketNames = ["UsersBDD", "ProductsBDD"];
      bucketNames.forEach((bucketName) => {
        this.buckets[bucketName] = this.cluster.bucket(bucketName);
      });

      console.log("✅ Successfully connected to Couchbase Capella!");
    } catch (error) {
      console.error("❌ Connection error to Couchbase Capella:", error.message);
      throw new Error("Unable to connect to Couchbase Capella");
    }
  }

  /**
   * @brief Closes the Couchbase connection when the module is destroyed.
   */
  async onModuleDestroy() {
    await this.cluster.close();
    console.log("🔹 Couchbase connection closed.");
  }

  /**
   * @brief Retrieves the default collection from a specified Couchbase bucket.
   * @param {string} bucketName - The name of the bucket.
   * @returns {Promise<couchbase.Collection>} - The collection of the specified bucket.
   * @throws {Error} If the bucket is not initialized.
   */
  async getCollection(
    bucketName: string = "ProductsBDD"
  ): Promise<couchbase.Collection> {
    if (!this.buckets[bucketName]) {
      console.error(
        `❌ Bucket "${bucketName}" is not initialized. Defaulting to "ProductsBDD"`
      );
      bucketName = "ProductsBDD"; // Forcer un bucket par défaut
    }
    return this.buckets[bucketName].defaultCollection();
  }

  /**
   * @brief Executes a N1QL query to retrieve all data from the specified Couchbase bucket.
   * @returns {Promise<any[]>} A list of all documents.
   * @throws {Error} If the query execution fails.
   */
  async getAllData(bucketName: string): Promise<any[]> {
    try {
      console.log(`🔹 Executing N1QL query: SELECT * FROM \`${bucketName}\``);
      const query = `SELECT * FROM \`${bucketName}\``;
      const result = await this.cluster.query(query);
      return result.rows;
    } catch (error) {
      console.error(
        `❌ Error while retrieving data from ${bucketName}:`,
        error
      );
      return [];
    }
  }

  /**
   * @brief Executes a Full-Text Search (FTS) query on Couchbase.
   * @param {string} bucketName - The name of the bucket.
   * @param {string} searchQuery - The query string to search for.
   * @returns {Promise<any[]>} A promise resolving with an array of search results.
   * @throws {Error} If the search query execution fails.
   */
  async searchQuery(bucketName: string, searchQuery: string): Promise<any[]> {
    try {
      console.log(`🔹 Performing search in ${bucketName} for: ${searchQuery}`);

      const prefixQuery = couchbase.SearchQuery.prefix(searchQuery);
      const matchQuery = couchbase.SearchQuery.match(searchQuery);
      const combinedQuery = couchbase.SearchQuery.disjuncts(
        prefixQuery,
        matchQuery
      );

      const searchRes = await this.cluster.searchQuery(
        bucketName,
        combinedQuery,
        {
          fields: ["name", "description", "category", "tags"],
          highlight: {
            style: couchbase.HighlightStyle.HTML,
            fields: ["name", "description", "category", "tags"],
          },
        }
      );

      return searchRes.rows;
    } catch (error) {
      console.error(`❌ Error executing search query in ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * @brief Executes a N1QL query dynamically.
   * @param {string} query - The N1QL query string.
   * @param {any} params - Optional parameters for the query.
   * @returns {Promise<any[]>} - The query result.
   * @throws {InternalServerErrorException} If the query execution fails.
   */
  async executeQuery(query: string, params?: any): Promise<any[]> {
    try {
      console.log(`🔹 Executing query: ${query} with params:`, params);
      const result = await this.cluster.query(query, { parameters: params });
      return result.rows;
    } catch (error) {
      console.error("❌ Error executing query:", error);
      throw new InternalServerErrorException("Database query failed");
    }
  }

  /**
   * @brief Retrieves alternative products based on search criteria from Couchbase.
   * @param {string} bucketName - The name of the bucket.
   * @param {any} searchCriteria - Object containing the search filters such as category, tags, and brand.
   * @returns {Promise<any[]>} A promise resolving with an array of alternative products.
   * @throws {InternalServerErrorException} If the query execution fails.
   */
  async getAlternativeProducts(
    bucketName: string,
    searchCriteria: any
  ): Promise<any[]> {
    try {
      if (Object.keys(searchCriteria).length === 0) {
        throw new Error("❌ searchCriteria is empty");
      }

      console.log(`🔹 Searching alternatives with criteria:`, searchCriteria);

      const response = await this.httpService.axiosRef.get(
        "https://restcountries.com/v3.1/region/europe"
      );
      const europeanCountries = response.data.map(
        (country) => country.name.common
      );

      let query = `SELECT * FROM \`${bucketName}\` WHERE `;
      const queryConditions: string[] = [];
      const queryParams: any[] = [];

      if (searchCriteria.category) {
        queryConditions.push("category = ?");
        queryParams.push(searchCriteria.category);
      }

      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
        queryConditions.push("ANY tag IN tags SATISFIES tag IN ? END");
        queryParams.push(searchCriteria.tags);
      }

      if (searchCriteria.brand) {
        queryConditions.push("brand != ?");
        queryParams.push(searchCriteria.brand);
      }

      query += queryConditions.join(" AND ") + " LIMIT 10";

      console.log(
        `🔹 Executing N1QL query: ${query} with params:`,
        queryParams
      );

      const result = await this.cluster.query(query, {
        parameters: queryParams,
      });

      return result.rows.map((row) => row[bucketName]);
    } catch (error) {
      console.error(
        `❌ Error retrieving alternative products from ${bucketName}:`,
        error
      );
      throw new InternalServerErrorException(
        `Error retrieving alternative products from ${bucketName}`
      );
    }
  }

  /**
   * @brief Retrieves a document from Couchbase by its ID.
   * @param {string} bucketName - The name of the bucket.
   * @param {string} docId - The document ID.
   * @returns {Promise<any>} The retrieved document or `null` if not found.
   * @throws {Error} If the query fails.
   */
  async getDocumentById(bucketName: string, docId: string): Promise<any> {
    try {
      console.log(
        `🔹 Retrieving document with ID: ${docId} from ${bucketName}`
      );

      const query = `SELECT * FROM \`${bucketName}\` WHERE META().id = ?`;
      const options = { parameters: [docId] };
      const result = await this.cluster.query(query, options);

      return result.rows.length > 0 ? result.rows[0][bucketName] : null;
    } catch (error) {
      console.error(`❌ Error retrieving document from ${bucketName}:`, error);
      throw new Error(`Error retrieving document from ${bucketName}`);
    }
  }

  /**
   * @brief Inserts a document into the specified bucket.
   * @param {string} bucketName - The name of the bucket.
   * @param {string} docId - The document ID.
   * @param {any} data - The data to be inserted.
   * @throws {InternalServerErrorException} If the insertion fails.
   */
  async insertDocument(
    bucketName: string,
    docId: string,
    data: any
  ): Promise<void> {
    try {
      const collection = await this.getCollection(bucketName);
      await collection.insert(docId, data);
      console.log(`✅ Successfully inserted document into ${bucketName}`);
    } catch (error) {
      console.error(`❌ Error inserting document into ${bucketName}:`, error);
      throw new InternalServerErrorException(
        `Error inserting document into ${bucketName}`
      );
    }
  }
}
