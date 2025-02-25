﻿/**
 * @file database.service.ts
 * @brief Service for handling database operations in Couchbase.
 * 
 * This service provides functionalities to interact with Couchbase, including:
 * - Connection management for multiple buckets (`products` and `users`).
 * - CRUD operations on products and users collections.
 * - Execution of N1QL queries and Full-Text Search (FTS).
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
  // Buckets
  private productsBucket: couchbase.Bucket;
  private usersBucket: couchbase.Bucket;
  private categBucket: couchbase.Bucket;
  private brandBucket: couchbase.Bucket;
  // Collections
  private productsCollection: couchbase.Collection;
  private usersCollection: couchbase.Collection;
  private categCollection: couchbase.Collection;
  private brandCollection: couchbase.Collection;

  // User role
  private _role = {
    Admin: 'Admin',
    User: 'User'
  };

  constructor(private readonly httpService: HttpService) { }

  // ======================== DATABASE INIT AND CONNECTION
  /**
   * @brief Initializes the Couchbase connection when the module starts.
   * 
   * This method loads the SSL certificate and establishes connections
   * to the Couchbase Capella cluster for products and users buckets.
   */
  async onModuleInit() {
    await this.initializeConnections();
  }

  /**
   * @brief Initializes Couchbase connections for products and users buckets.
   * 
   * This method ensures a secure connection to Couchbase using an SSL certificate
   * and initializes collections for product and user data storage.
   */
  private async initializeConnections() {
    try {
      console.log("🔹 Initializing Couchbase connections...");

      const certPath = process.env.SSL_CERT_PATH;
      if (!certPath) {
        throw new Error("❌ SSL_CERT_PATH is not set in environment variables");
      }
      const cert = fs.readFileSync(certPath);
      console.log("🔹 SSL Certificate loaded.");

      console.log("🔹 Connecting to Couchbase Capella...");
      this.cluster = await couchbase.connect(process.env.DB_HOST, {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        configProfile: "wanDevelopment", // Required for WAN connections
      });

      // Connect to the products bucket
      const productsBucketName = process.env.BUCKET_NAME;
      if (!productsBucketName) {
        throw new Error("❌ BUCKET_NAME is not defined in environment variables in database.service.ts");
      }
      this.productsBucket = this.cluster.bucket(productsBucketName);
      this.productsCollection = this.productsBucket.defaultCollection();

      // Connect to the users bucket
      const usersBucketName = process.env.USER_BUCKET_NAME;
      if (!usersBucketName) {
        throw new Error("❌ USER_BUCKET_NAME is not defined in environment variables in database.service.ts");
      }
      this.usersBucket = this.cluster.bucket(usersBucketName);
      this.usersCollection = this.usersBucket.defaultCollection();

      // Connect to the category bucket
      const categBucketName = process.env.CATEGORY_BUCKET_NAME;
      if (!categBucketName) {
        throw new Error("❌ CATEGORY_BUCKET_NAME is not defined in environment variables in database.service.ts");
      }
      this.categBucket = this.cluster.bucket(categBucketName);
      this.categCollection = this.categBucket.defaultCollection();

      // Connect to the brand bucket
      const brandBucketName = process.env.BRAND_BUCKET_NAME;
      if (!brandBucketName) {
        throw new Error("❌ BRAND_BUCKET_NAME is not defined in environment variables in database.service.ts");
      }
      this.brandBucket = this.cluster.bucket(brandBucketName);
      this.brandCollection = this.brandBucket.defaultCollection();

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
    await this.cluster?.close();
    console.log("🔹 Couchbase connections closed.");
  }

  // ======================== DATABASE GET BUCKETS AND COLLECTION
  /**
   * @brief Retrieves the Couchbase bucket instance for products.
   * 
   * This method returns the initialized Couchbase bucket for storing and retrieving product data.
   * If the bucket is not initialized, it throws an error.
   * 
   * @returns {couchbase.Bucket} The initialized products bucket.
   * @throws {Error} If the products bucket is not initialized.
   */
  getProductsBucket(): couchbase.Bucket {
    if (!this.productsBucket) {
      throw new Error("❌ Couchbase bucket is not initialized yet.");
    }
    return this.productsBucket;
  }

  /**
   * @brief Retrieves the Couchbase bucket instance for users.
   * 
   * This method returns the initialized Couchbase bucket for managing user data.
   * If the bucket is not initialized, it throws an error.
   * 
   * @returns {couchbase.Bucket} The initialized users bucket.
   * @throws {Error} If the users bucket is not initialized.
   */
  getUsersBucket(): couchbase.Bucket {
    if (!this.usersBucket) {
      throw new Error("❌ Couchbase bucket is not initialized yet.");
    }
    return this.usersBucket;
  }

  /**
   * @brief Retrieves the Couchbase bucket instance for category.
   * 
   * This method returns the initialized Couchbase bucket for managing category data.
   * If the bucket is not initialized, it throws an error.
   * 
   * @returns {couchbase.Bucket} The initialized category bucket.
   * @throws {Error} If the category bucket is not initialized.
   */
  getCategBucket(): couchbase.Bucket {
    if (!this.categBucket) {
      throw new Error("❌ Couchbase bucket is not initialized yet.");
    }
    return this.categBucket;
  }

  /**
   * @brief Retrieves the Couchbase bucket instance for brand.
   * 
   * This method returns the initialized Couchbase bucket for managing brand data.
   * If the bucket is not initialized, it throws an error.
   * 
   * @returns {couchbase.Bucket} The initialized brand bucket.
   * @throws {Error} If the brand bucket is not initialized.
   */
  getBrandBucket(): couchbase.Bucket {
    if (!this.brandBucket) {
      throw new Error("❌ Couchbase bucket is not initialized yet.");
    }
    return this.brandBucket;
  }

  /**
   * Returns the products collection.
   */
  getProductsCollection(): couchbase.Collection {
    if (!this.productsCollection) {
      throw new Error("Products collection is not initialized.");
    }
    return this.productsCollection;
  }

  /**
   * Returns the users collection.
   */
  getUsersCollection(): couchbase.Collection {
    if (!this.usersCollection) {
      throw new Error("Users collection is not initialized.");
    }
    return this.usersCollection;
  }

  /**
   * Returns the category collection.
   */
  getCategCollection(): couchbase.Collection {
    if (!this.categCollection) {
      throw new Error("Users collection is not initialized.");
    }
    return this.categCollection;
  }

  /**
   * Returns the brand collection.
   */
  getBrandCollection(): couchbase.Collection {
    if (!this.brandCollection) {
      throw new Error("Brand collection is not initialized.");
    }
    return this.brandCollection;
  }

  // ======================== UTILITY FUNCTIONS
  /**
   * @brief Retrieves all products stored in the database.
   * 
   * Executes an N1QL query to fetch all product documents from Couchbase.
   * 
   * @returns {Promise<any[]>} An array containing all product records.
   * @throws {Error} If the query execution fails.
   */
  async getAllProductsData(): Promise<any[]> {
    try {
      console.log(`🔹 Executing N1QL query on \`${this.productsBucket.name}\``);

      // Execute query on product bucket
      const query = `SELECT * FROM \`${this.productsBucket.name}\``;
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
   * @brief Retrieves a specific product from Couchbase by its ID.
   * 
   * @param {string} productId - The ID of the product to retrieve.
   * @returns {Promise<any>} - The product details or `null` if not found.
   * @throws {Error} If the query execution fails.
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
   * @brief Retrieves alternative products based on search criteria from Couchbase.
   * 
   * This method constructs a dynamic N1QL query to fetch alternative products from Couchbase
   * based on the given search criteria. It also integrates an external API call to retrieve
   * a list of European countries, ensuring that only European-origin products are included.
   * 
   * @param {any} searchCriteria - Object containing the search filters such as category, tags, and brand.
   * @returns {Promise<any[]>} A promise resolving with an array of alternative products.
   * @throws {InternalServerErrorException} If the query execution fails or no search criteria are provided.
   */
  async getAlternativeProducts(searchCriteria: any): Promise<any[]> {
    const bucketName = this.productsBucket.name;

    try {
      if (Object.keys(searchCriteria).length === 0) {
        throw new Error("❌ searchCriteria is empty");
      }

      console.log(`🔹 Searching alternatives with criteria:`, searchCriteria);

      // API call to fetch the list of European countries
      const response = await this.httpService.axiosRef.get('https://restcountries.com/v3.1/region/europe');
      const europeanCountries = response.data.map(country => country.name.common);

      // Dynamically construct the N1QL query
      let query = `SELECT * FROM \`${bucketName}\` WHERE `;
      const queryConditions: string[] = [];
      const queryParams: any[] = [];

      // Add conditions dynamically based on provided criteria
      // Exclude the product that was searched (by ID)
      if (searchCriteria.searchedProductID) {
        queryConditions.push("id != ?");
        queryParams.push(searchCriteria.searchedProductID); // Exclude the searched product
      }

      if (searchCriteria.category) {
        queryConditions.push("category = ?");
        queryParams.push(searchCriteria.category);
      }

      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
        queryConditions.push("ANY tag IN tags SATISFIES tag IN ? END");
        queryParams.push(searchCriteria.tags); // Ensures at least one tag matches
      }

      if (searchCriteria.brand) {
        queryConditions.push("brand != ?");
        queryParams.push(searchCriteria.brand); // Exclude the same brand
      }

      // Filter only European products
      queryConditions.push("origin IN ?");
      queryParams.push(europeanCountries); // Verify if the origin is European

      // Finalize the query with conditions
      query += queryConditions.join(" AND ");

      console.log(`🔹 Executing N1QL query: ${query} with params:`, queryParams);

      // Execute the query in Couchbase
      const result = await this.cluster.query(query, { parameters: queryParams });
      return result.rows.map(row => row[bucketName]); // Extract product data
    } catch (error) {
      console.error("❌ Error retrieving alternative products (database.service):", error);
      throw new InternalServerErrorException("Error retrieving alternative products (database.service)");
    }
  }

  /**
  * @brief Retrieves a user from Couchbase by their email.
  * 
  * @param {string} email - The email of the user to retrieve.
  * @returns {Promise<any>} - The user details or `null` if not found.
  * @throws {InternalServerErrorException} If an error occurs during retrieval.
  */
  async getUserByEmail(email: string): Promise<any> {
    try {
      // Check if users bucket is initialized
      if (!this.usersBucket) {
        throw new Error("❌ Users bucket is not initialized.");
      }

      // Building an N1QL query
      const query = `SELECT META(u).id, u.* FROM \`${this.usersBucket.name}\`._default._default u WHERE u.email = $email`;

      // Executing query with secured settings
      const result = await this.cluster.query(query, { parameters: { email } });

      if (result.rows.length === 0) {
        console.warn(`⚠️ User with email "${email}" not found.`);
        return null;
      }

      return result.rows[0]; // return the found user
    } catch (error) {
      console.error("❌ Error retrieving user by email:", error);
      throw new InternalServerErrorException("Error retrieving user by email.");
    }
  }

  /**
   * @brief Adds a new user to the Couchbase database.
   *
   * @details This function checks if the user's email already exists in the database. If not, it creates a new user document with the provided username, email, password, and a default role of "User". The document is inserted into the Couchbase database.
   * It also adds timestamps for `createdAt` and `updatedAt` fields to track when the user was created and last updated.
   * 
   * @param username The username of the new user.
   * @param email The email of the new user, used as the unique identifier.
   * @param password The password of the new user, stored as plain text (must be hashed before actual usage).
   * 
   * @returns A Promise that resolves to the result of the insertion query, or null if the user already exists.
   * 
   * @throws InternalServerErrorException If there is an error during the insertion process.
   */
  async addUser(username: string, email: string, password: string): Promise<any> {
    try {
      // Check if the users bucket is initialized
      if (!this.usersBucket) {
        throw new Error("❌ Users bucket is not initialized.");
      }

      // Check if a user with the same email already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        console.warn(`⚠️ A user with the email "${email}" already exists.`);
        return null; // Return null if the user already exists
      }

      // Create the user object with the provided information
      const newUser = {
        username: username,
        email: email,
        password: password,
        role: this._role.User, // Default user role
        createdAt: new Date().toISOString(), // Adding createdAt timestamp
        updatedAt: new Date().toISOString()  // Adding updatedAt timestamp
      };

      // Generate a unique identifier for the user document
      const userId = `user::${email}`; // Unique ID based on the email

      // Construct the N1QL query to insert the user
      const query = `
      INSERT INTO \`${this.usersBucket.name}\`._default._default (KEY, VALUE)
      VALUES ($userId, $newUser)
    `;

      // Execute the query with the parameters
      const result = await this.cluster.query(query, {
        parameters: { userId, newUser }
      });

      // Return the result of the insertion
      return result;
    } catch (error) {
      console.error("❌ Error occurred while adding the user:", error);
      throw new InternalServerErrorException("Error occurred while adding the user.");
    }
  }

  /**
   * @brief Retrieves all category names from the Couchbase database.
   *
   * @returns {Promise<any[]>} - A promise that resolves with an array of category names.
   * @throws {InternalServerErrorException} If an error occurs during retrieval.
   */
  async getAllCategName(): Promise<any[]> {
    try {
      // Check if the categories bucket is initialized
      if (!this.categBucket) {
        throw new Error("❌ Categories bucket is not initialized.");
      }

      // Build the N1QL query to retrieve category names
      const query = `
      SELECT c.name
      FROM \`${this.categBucket.name}\`._default._default c
    `;

      // Execute the query
      const result = await this.cluster.query(query);

      // If no categories are found
      if (result.rows.length === 0) {
        console.warn("⚠️ No categories found.");
        return [];
      }

      // Extract the category names from the result
      const categoryNames = result.rows.map((row: any) => row.name);

      return categoryNames; // Return the list of category names
    } catch (error) {
      console.error("❌ Error retrieving category names:", error);
      throw new InternalServerErrorException("Error retrieving category names.");
    }
  }

  /**
   * @brief Retrieves all brand names from the database.
   * 
   * This function executes a N1QL query to fetch all brand names from the specified Couchbase bucket.
   * It checks the initialization of the brand bucket before executing the query and handles potential errors.
   * If no brands are found, an empty array is returned.
   * 
   * @returns {Promise<any[]>} A promise resolving to an array of brand names.
   * 
   * @throws {InternalServerErrorException} If the brand bucket is not initialized or if an error occurs during query execution.
   */
  async getAllBrandName(): Promise<any[]> {
    const brandBucketName = this.brandBucket.name;
    try {
      // Verify if the brand bucket is initialized
      if (!this.brandBucket) {
        throw new Error("❌ Brand bucket is not initialized.");
      }

      // Construct the N1QL query to retrieve brand names
      const query = `
      SELECT b.name
      FROM \`${brandBucketName}\`._default._default b
    `;

      // Execute the query
      const result = await this.cluster.query(query);

      // Handle the case where no brands are found
      if (result.rows.length === 0) {
        console.warn("⚠️ No brand names found.");
        return [];
      }

      // Extract and return the brand names from the query result
      const brandNames = result.rows.map((row: any) => row.name);
      return brandNames;

    } catch (error) {
      console.error("❌ Error retrieving brand names:", error);
      throw new InternalServerErrorException("Error retrieving brand names.");
    }
  }

  /**
   * @brief Retrieves products associated with a specified brand.
   * 
   * @details
   * Executes a N1QL query that performs a join between the products and brands buckets.
   * This function searches for products whose foreign key (`FK_Brands`) matches the given brand name.
   * 
   * @param brandName The name of the brand to search for.
   * 
   * @returns {Promise<any[]>} An array of objects containing product and brand names.  
   * 
   * @throws {Error} Throws an error if the query execution fails.
   */
  async getProductsByBrand(brandName: string): Promise<any> {
    const productsBucketName = this.productsBucket.name;
    const brandBucketName = this.brandBucket.name;

    const query = `
      SELECT p.name AS productName, b.name AS brandName
      FROM \`${productsBucketName}\` p
      JOIN \`${brandBucketName}\` b ON KEYS p.FK_Brands
      WHERE b.name = $brandName
    `;

    try {
      const result = await this.cluster.query(query, { parameters: { brandName } });
      console.log("Query result:\n", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  // ======================== SEARCH FUNCTIONS (ALTERNATIVE PRODUCTS, NOT THE SUGGESTIONS)
  // =========== UTILITY FUNCTIONS
  /**
   * @brief Builds a SQL WHERE clause from an array of conditions.
   * 
   * @details
   * Takes an array of condition strings and joins them with `AND`.  
   * Returns an empty string if no conditions are provided.
   * 
   * @param conditions An array of condition strings (e.g., `"price >= $minPrice"`).
   * @returns {string} A formatted SQL condition string or an empty string if no conditions are given.
   * @example
   * buildConditions(["price >= $minPrice", "category = $category"])
   * // Returns: "(price >= $minPrice AND category = $category)"
   */
  buildConditions(conditions: string[]): string {
    return conditions.length ? `(${conditions.join(" AND ")})` : "";
  }

  /**
   * @brief Builds similarity-based conditions using attributes of a selected product.
   *
   * @details
   * Fetches a product by its ID and constructs conditions to find similar products.  
   * Similarity criteria include:
   * - Category match  
   * - Shared tags  
   * - Price within ±20% of the selected product’s price  
   * - Same brand (FK_Brands)
   *
   * @param productId The ID of the selected product for similarity comparison.
   * @returns {Promise<string>} A string containing similarity conditions or an empty string if no product is found.
   * @throws {Error} If the product is not found or the query fails.
   */
  async buildSimilarityConditions(this: any, productId: string): Promise<string> {
    if (!productId) return "";

    const selectedProduct = await this.getProductById(productId);
    if (!selectedProduct) throw new Error(`❌ Product with ID ${productId} not found.`);

    const conditions: string[] = [];
    if (selectedProduct.category) conditions.push(`category = $category`);
    if (selectedProduct.tags?.length) conditions.push(`ANY tag IN tags SATISFIES tag IN $tags END`);
    if (selectedProduct.price) conditions.push(`price BETWEEN $minPrice AND $maxPrice`);
    if (selectedProduct.FK_Brands) conditions.push(`FK_Brands = $brandFK`);

    return this.buildConditions(conditions);
  }

  /**
   * @brief Builds filter-based conditions based on user-provided criteria.
   *
   * @details
   * Constructs query conditions using user filters for:
   * - Category
   * - Country of origin
   * - Price range
   * - Brand (via subquery to resolve foreign key reference)
   * 
   * If a brand is provided without a product ID, it performs a subquery to find the corresponding `FK_Brands`.
   *
   * @param filters The filters object containing user-provided criteria.
   * @param brandBucketName Name of the Couchbase bucket containing brand documents.
   * @returns {Promise<string>} A string containing filter conditions.
   */
  async buildFilterConditions(this: any, filters: any, brandBucketName: string): Promise<string> {
    const conditions: string[] = [];

    if (filters.category) conditions.push(`category = $filterCategory`);
    if (filters.country) conditions.push(`origin = $filterCountry`);
    if (filters.minPrice && filters.maxPrice) {
      conditions.push(`price BETWEEN $filterMinPrice AND $filterMaxPrice`);
    } else if (filters.minPrice) {
      conditions.push(`price >= $filterMinPrice`);
    } else if (filters.maxPrice) {
      conditions.push(`price <= $filterMaxPrice`);
    }

    if (filters.brand && !filters.productId) {
      console.log(`🔎 Checking brand FK for brand: ${filters.brand}`);
      const brandResult = await this.getProductsByBrand(filters.brand);
      const brandFK = brandResult?.[0]?.brandName;

      if (brandFK) {
        const brandSubquery = `(SELECT RAW META(b).id FROM \`${brandBucketName}\` b WHERE b.name = $filterBrandName LIMIT 1)`;
        console.log('brandSubquery:\n', brandSubquery);
        conditions.push(`FK_Brands IN ${brandSubquery}`);
      } else {
        console.warn(`⚠️ No FK_Brands found for brand: ${filters.brand}`);
      }
    }
    return this.buildConditions(conditions);
  }

  /**
   * @brief Builds the final SQL query based on similarity and filter conditions.
   *
   * @details
   * Combines similarity and filter conditions into a single WHERE clause.  
   * - `/searched-prod`: Combines conditions with `AND` for stricter matching.  
   * - `/home`: Combines conditions with `OR` for broader matching.  
   * 
   * @param similarityClause The similarity conditions string.
   * @param filtersClause The filter conditions string.
   * @param currentRoute The current route determining the logical operator to use.
   * @param bucketName Name of the Couchbase bucket containing product documents.
   * @returns {string} A full N1QL query string.
   * @throws {Error} If the route is unrecognized.
   */
  buildQuery(similarityClause: string, filtersClause: string, currentRoute: string, bucketName: string): string {
    if (!similarityClause && !filtersClause) return "";

    let whereClause = "";
    if (currentRoute === "/searched-prod") {
      whereClause = [similarityClause, filtersClause].filter(Boolean).join(" AND ");
    } else if (currentRoute === "/home") {
      whereClause = [similarityClause, filtersClause].filter(Boolean).join(" OR ");
    } else {
      throw new Error(`❌ Unknown route: ${currentRoute}`);
    }

    return `SELECT * FROM \`${bucketName}\` WHERE ${whereClause}`;
  }

  // =========== MAIN FUNCTION
  /**
   * @brief Retrieves products based on filters and/or similarity to a selected product.
   *
   * @details
   * Main function that:
   * - Builds similarity conditions if a product ID is provided.
   * - Builds filter conditions based on user inputs.
   * - Combines conditions depending on the current route:
   *   - `/searched-prod`: Products must satisfy both conditions (`AND`).
   *   - `/home`: Products satisfying either condition are returned (`OR`).
   * - Executes the final query and returns matching products.
   * 
   * Handles subqueries for brand foreign keys (FK_Brands)  
   * Filters include category, price range, country, and brand
   *
   * @param filters An object containing:
   *   - `category` (string): Product category to filter.
   *   - `country` (string): Country of origin.
   *   - `minPrice` (number): Minimum price.
   *   - `maxPrice` (number): Maximum price.
   *   - `brand` (string): Brand name.
   *   - `productId` (string): Product ID for similarity search.
   *   - `currentRoute` (string): Route context (`/home` or `/searched-prod`).
   * @returns {Promise<any[]>} An array of matching product objects.
   * @throws {Error} If query construction or execution fails.
   */
  async getProductsWithFilters(this: any, filters: any): Promise<any[]> {
    const bucketName = this.productsBucket.name;
    const brandBucketName = this.brandBucket.name;
    const { currentRoute, productId } = filters;

    if (!Object.keys(filters).length) {
      throw new Error("❌ Filters are empty");
    }

    // Step 1 : Construction of similarity conditions (if productId is supplied)
    const similarityClause = productId ? await this.buildSimilarityConditions.call(this, productId) : "";

    // Step 2 : Construction of filter-based conditions (including brand subquery)
    const filtersClause = await this.buildFilterConditions.call(this, filters, brandBucketName);

    // Step 3 : Building the final query based on the route
    const queryWithJoin = this.buildQuery(similarityClause, filtersClause, currentRoute, bucketName);

    if (!queryWithJoin) return [];

    // Step 4 : Preparation of linked parameters
    const selectedProduct = productId ? await this.getProductById(productId) : null;
    const parameters = {
      category: selectedProduct?.category,
      tags: selectedProduct?.tags || [],
      minPrice: selectedProduct?.price ? selectedProduct.price * 0.8 : undefined,
      maxPrice: selectedProduct?.price ? selectedProduct.price * 1.2 : undefined,
      brandFK: selectedProduct?.FK_Brands,
      filterCategory: filters.category,
      filterCountry: filters.country,
      filterMinPrice: filters.minPrice,
      filterMaxPrice: filters.maxPrice,
      filterBrandName: filters.brand,
    };

    // Step 5 : Query execution and results management
    try {
      console.log(`🔹 Executing query: ${queryWithJoin}`);
      const result = await this.cluster.query(queryWithJoin, { parameters });
      console.log(`📦 Total products found: ${result.rows.length}`);
      return result.rows.map(row => row[bucketName]);
    } catch (error) {
      console.error("❌ Error executing query:", error);
      throw new Error("An error occurred while retrieving the filtered products.");
    }
  }

}