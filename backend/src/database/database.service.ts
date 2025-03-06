/**
 * @file database.service.ts
 * @brief Service for handling database operations in Couchbase.
 *
 * This service provides functionalities to interact with Couchbase, including:
 * - Connection management for multiple buckets (`products` and `users`).
 * - CRUD operations on products and users collections.
 * - Execution of N1QL queries and Full-Text Search (FTS).
 */

// Other
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import {
  Bucket,
  Cluster,
  Collection,
  connect,
  SearchQuery,
  HighlightStyle,
  DocumentNotFoundError,
} from "couchbase";
import * as fs from "fs";
// HTTP
import { HttpService } from "@nestjs/axios";
import { UserRole } from "src/auth/enums/roles.enum";
// .env
import * as dotenv from "dotenv";
// Generate unique ID
import { v4 as uuidv4 } from "uuid";

dotenv.config();

/**
 * @brief Service responsible for database operations.
 * @details This service manages connections to Couchbase buckets and provides methods
 * for interacting with the database, including CRUD operations and search functionality.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private cluster: Cluster;
  // Buckets
  private productsBucket: Bucket;
  private usersBucket: Bucket;
  private categBucket: Bucket;
  private brandBucket: Bucket;
  // Collections
  private productsCollection: Collection;
  private usersCollection: Collection;
  private categCollection: Collection;
  private brandCollection: Collection;

  /**
   * @brief Constructor for DatabaseService.
   * @param {HttpService} httpService - Service for making HTTP requests.
   */
  constructor(private readonly httpService: HttpService) {
    this.initializeConnections();
  }

  // ========================================================================
  // ======================== DATABASE INIT AND CONNECTION
  // ========================================================================
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
      const certPath = process.env.SSL_CERT_PATH;
      if (!certPath) {
        throw new Error("❌ SSL_CERT_PATH is not set in environment variables");
      }
      // Vérifier que le certificat existe
      fs.readFileSync(certPath);
      console.log("🔹 SSL Certificate loaded.");

      console.log("🔹 Connecting to Couchbase Capella...");
      this.cluster = await connect(
        process.env.DB_HOST || "couchbase://localhost",
        {
          username: process.env.DB_USER || "Administrator",
          password: process.env.DB_PASSWORD || "password",
          configProfile: "wanDevelopment", // Required for WAN connections
        },
      );

      // Connect to the products bucket
      const productsBucketName = process.env.BUCKET_NAME;
      if (!productsBucketName) {
        throw new Error(
          "❌ BUCKET_NAME is not defined in environment variables in database.service.ts",
        );
      }
      this.productsBucket = this.cluster.bucket(productsBucketName);
      this.productsCollection = this.productsBucket.defaultCollection();

      // Connect to the users bucket
      const usersBucketName = process.env.USER_BUCKET_NAME;
      if (!usersBucketName) {
        throw new Error(
          "❌ USER_BUCKET_NAME is not defined in environment variables in database.service.ts",
        );
      }
      this.usersBucket = this.cluster.bucket(usersBucketName);
      this.usersCollection = this.usersBucket.defaultCollection();

      // Connect to the category bucket
      const categBucketName = process.env.CATEGORY_BUCKET_NAME;
      if (!categBucketName) {
        throw new Error(
          "❌ CATEGORY_BUCKET_NAME is not defined in environment variables in database.service.ts",
        );
      }
      this.categBucket = this.cluster.bucket(categBucketName);
      this.categCollection = this.categBucket.defaultCollection();

      // Connect to the brand bucket
      const brandBucketName = process.env.BRAND_BUCKET_NAME;
      if (!brandBucketName) {
        throw new Error(
          "❌ BRAND_BUCKET_NAME is not defined in environment variables in database.service.ts",
        );
      }
      this.brandBucket = this.cluster.bucket(brandBucketName);
      this.brandCollection = this.brandBucket.defaultCollection();

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
  }

  // ========================================================================
  // ======================== DATABASE GET BUCKETS AND COLLECTION
  // ========================================================================
  /**
   * @brief Retrieves the Couchbase bucket instance for products.
   *
   * This method returns the initialized Couchbase bucket for storing and retrieving product data.
   * If the bucket is not initialized, it throws an error.
   *
   * @returns {couchbase.Bucket} The initialized products bucket.
   * @throws {Error} If the products bucket is not initialized.
   */
  getProductsBucket(): Bucket {
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
  getUsersBucket(): Bucket {
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
  getCategBucket(): Bucket {
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
  getBrandBucket(): Bucket {
    if (!this.brandBucket) {
      throw new Error("❌ Couchbase bucket is not initialized yet.");
    }
    return this.brandBucket;
  }

  /**
   * @brief Retrieves the products collection.
   * @details This method returns the initialized Couchbase collection for products.
   *
   * @returns {couchbase.Collection} The initialized products collection.
   * @throws {Error} If the products collection is not initialized.
   */
  getProductsCollection(): Collection {
    if (!this.productsCollection) {
      throw new Error("Products collection is not initialized.");
    }
    return this.productsCollection;
  }

  /**
   * @brief Retrieves the users collection.
   * @details This method returns the initialized Couchbase collection for users.
   *
   * @returns {couchbase.Collection} The initialized users collection.
   * @throws {Error} If the users collection is not initialized.
   */
  getUsersCollection(): Collection {
    if (!this.usersCollection) {
      throw new Error("Users collection is not initialized.");
    }
    return this.usersCollection;
  }

  /**
   * @brief Retrieves the category collection.
   * @details This method returns the initialized Couchbase collection for categories.
   *
   * @returns {couchbase.Collection} The initialized category collection.
   * @throws {Error} If the category collection is not initialized.
   */
  getCategCollection(): Collection {
    if (!this.categCollection) {
      throw new Error("Category collection is not initialized.");
    }
    return this.categCollection;
  }

  /**
   * @brief Retrieves the brand collection.
   * @details This method returns the initialized Couchbase collection for brands.
   *
   * @returns {couchbase.Collection} The initialized brand collection.
   * @throws {Error} If the brand collection is not initialized.
   */
  getBrandCollection(): Collection {
    if (!this.brandCollection) {
      throw new Error("Brand collection is not initialized.");
    }
    return this.brandCollection;
  }
  // ========================================================================
  // ======================== CATEGORY FUNCTIONS
  // ========================================================================
  /**
   * @function getAllCategName
   * @description Alias pour getAllCategoryName pour maintenir la compatibilité avec le contrôleur
   * @returns {Promise<any[]>} A promise that resolves with an array of category names
   */
  async getAllCategName(): Promise<any[]> {
    return this.getAllCategoryName();
  }

  /**
   * @function getAllCategoryName
   * @description Retrieves all category names from the Couchbase database
   * @details This function executes a N1QL query to fetch all category names.
   * It includes enhanced error handling and logging to diagnose connection issues.
   *
   * @returns {Promise<any[]>} A promise that resolves with an array of category names or empty array on error
   */
  async getAllCategoryName(): Promise<any[]> {
    try {
      console.log("🔍 Attempting to retrieve all category names...");

      if (!this.cluster) {
        console.log("⚠️ Cluster not initialized, attempting to reconnect...");
        await this.initializeConnections();

        if (!this.cluster) {
          console.error("❌ Failed to initialize cluster connection");
          throw new Error("Failed to initialize cluster connection");
        }
      }

      const categBucketName = process.env.CATEGORY_BUCKET_NAME;
      if (!categBucketName) {
        console.error("❌ CATEGORY_BUCKET_NAME not defined in environment variables");
        throw new Error("CATEGORY_BUCKET_NAME not defined in environment variables");
      }

      const query = `
        SELECT DISTINCT c.name
        FROM \`${categBucketName}\`._default._default c
        ORDER BY c.name`;

      console.log("🔍 Executing query:", query);

      const result = await this.cluster.query(query);
      console.log(
        `✅ Categories retrieved successfully: ${result.rows.length} categories found`,
      );

      // Return empty array if no results
      if (!result.rows || result.rows.length === 0) {
        console.log("⚠️ No categories found, returning empty array");
        return [];
      }

      return result.rows;
    } catch (error) {
      console.error("❌ Error retrieving categories:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Return empty array on error to avoid blocking the UI
      return [];
    }
  }

  // ========================================================================
  // ======================== SEARCH FUNCTIONS (SUGGESTIONS)
  // ========================================================================
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
      const prefixQuery = SearchQuery.prefix(searchQuery); // Prefix search
      const matchQuery = SearchQuery.match(searchQuery); // Natural language search

      // Combine prefix and match queries
      const combinedQuery = SearchQuery.disjuncts(prefixQuery, matchQuery);

      const searchRes = await this.cluster.searchQuery(
        _indexName,
        combinedQuery,
        {
          fields: ["name", "description", "category", "tags"],
          highlight: {
            style: HighlightStyle.HTML,
            fields: ["name", "description", "category", "tags"],
          },
        },
      );

      return searchRes.rows;
    } catch (error) {
      console.error("❌ Error during FTS query:", error);
      throw error;
    }
  }

  // ========================================================================
  // ======================== SEARCH FUNCTIONS (ALTERNATIVE PRODUCTS, NOT THE SUGGESTIONS)
  // ========================================================================

  // =========== UTILITY FUNCTIONS
  /**
   * @brief Builds a SQL WHERE clause from an array of conditions.
   * 
   * @details
   * Takes an array of condition strings and joins them with `OR`.  
   * Returns an empty string if no conditions are provided.
   * 
   * @param conditions An array of condition strings (e.g., `"price >= $minPrice"`).
   * @returns {string} A formatted SQL condition string or an empty string if no conditions are given.
   */
  buildConditions(conditions: string[]): string {
    return conditions.length ? `(${conditions.join(" OR ")})` : "";
  }

  /**
   * @brief Builds similarity-based conditions using attributes of a selected product.
   *
   * @details
   * Fetches a product by its ID and constructs conditions to find similar products.  
   * Similarity criteria include:
   * - Category match  
   * - Shared tags  
   * - Price within ±20% of the selected product's price  
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
   * @brief Builds similarity conditions for an external product search.
   * 
   * Constructs a SQL-like condition string for filtering products based on 
   * attributes such as name, brand, category, and tags. This method is used 
   * when searching for similar products to an external product (e.g., from an API).
   * 
   * @param filters An object containing the filtering criteria:
   *   - `name` (string, optional): Product name.
   *   - `brand` (string, optional): Product brand.
   *   - `category` (string, optional): Product category.
   *   - `tags` (array, optional): List of tags associated with the product.
   * 
   * @returns {string} A dynamically constructed SQL-like condition string.
   * 
   * @note Uses parameterized placeholders (e.g., `$filterName`, `$filterBrand`) 
   * to prevent SQL injection when used in queries.
   */
  buildSimilarityConditionsFromExternalProduct(filters: any): string {
    const conditions: string[] = [];

    if (filters.name) conditions.push(`name = $filterName`);
    if (filters.brand) conditions.push(`brand = $filterBrand`);
    if (filters.category) conditions.push(`category = $filterCategory`);
    if (filters.tags?.length) conditions.push(`ANY tag IN tags SATISFIES tag IN $filterTags END`);

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
    if (filters.tags?.length) {
      conditions.push(`ANY tag IN tags SATISFIES tag IN $filterTags END`);
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
    // If the route il /searched-prod then prioritize filters
    switch (currentRoute) {
      case '/searched-prod':
        whereClause = [similarityClause, filtersClause].filter(Boolean).join(" AND ");
        break;
      default:
        whereClause = [similarityClause, filtersClause].filter(Boolean).join(" OR ");
        break
    }
    return `SELECT * FROM \`${bucketName}\` WHERE ${whereClause}`;
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
      const response = await this.httpService.axiosRef.get(
        "https://restcountries.com/v3.1/region/europe",
      );
      const europeanCountries = response.data.map(
        (country) => country.name.common,
      );

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

      console.log(
        `🔹 Executing N1QL query: ${query} with params:`,
        queryParams,
      );

      // Execute the query in Couchbase
      const result = await this.cluster.query(query, {
        parameters: queryParams,
      });
      return result.rows.map((row) => row[bucketName]); // Extract product data
    } catch (error) {
      console.error(
        "❌ Error retrieving alternative products (database.service):",
        error,
      );
      throw new InternalServerErrorException(
        "Error retrieving alternative products (database.service)",
      );
    }
  }

  // =========== MAIN FUNCTION
  /**
   * @brief Retrieves products based on filters and/or similarity to a selected product.
   *
   * @details
   * This function:
   * - Builds **similarity conditions** if a `productId` is provided.
   * - Builds **filter conditions** based on user inputs.
   * - **Combines conditions dynamically** based on the current route:
   *   - `/searched-prod`: Products must satisfy both similarity and filter conditions (`AND`).
   *   - `/home`: Products satisfying either condition are returned (`OR`).
   * - **Handles brand foreign keys (FK_Brands) with subqueries**.
   * - **Supports filtering by category, price range, country, brand, and tags**.
   *
   * @param filters An object containing search criteria:
   *   - `category` (string, optional): Filters products by category.
   *   - `country` (string, optional): Filters products by country of origin.
   *   - `minPrice` (number, optional): Sets the minimum price range.
   *   - `maxPrice` (number, optional): Sets the maximum price range.
   *   - `brand` (string, optional): Filters by brand name.
   *   - `tags` (array<string>, optional): Filters products containing specified tags.
   *   - `name` (string, optional): Searches for a product by name.
   *   - `productId` (string, optional): If provided, finds similar products.
   *   - `productSource` (string, optional): Specifies whether the product comes from an external API (`OpenFoodFacts`) or internal database (`Internal`).
   *   - `currentRoute` (string, required): Identifies the route context (`/home` or `/searched-prod`).
   *
   * @returns {Promise<any[]>} A promise resolving to an array of products matching the applied filters and/or similarity criteria.
   *
   * @throws {Error} If an error occurs during query construction or execution.
   *
   * @note
   * - If `productId` is provided and `productSource` is `Internal`, the function performs a **similarity search** in the database.
   * - If `productId` is provided and `productSource` is `OpenFoodFacts`, the function only applies **filter-based conditions**.
   * - Uses **parameterized placeholders** (e.g., `$filterCategory`, `$filterMinPrice`) to prevent SQL injection.
   */
  async getProductsWithFilters(this: any, filters: any): Promise<any[]> {
    const bucketName = this.productsBucket.name;
    const brandBucketName = this.brandBucket.name;
    const { currentRoute, productId, productSource } = filters;

    if (!Object.keys(filters).length) {
      throw new Error("❌ Filters are empty");
    }

    // Step 1: Build similarity conditions if productId is provided
    // Avoid similarity search if the product comes from an external API
    const similarityClause = (productId && productSource === "Internal")
      ? await this.buildSimilarityConditions.call(this, productId)
      : this.buildSimilarityConditionsFromExternalProduct(filters);

    // Step 2: Build filter-based conditions, including brand subqueries
    const filtersClause = await this.buildFilterConditions.call(this, filters, brandBucketName);

    // Step 3: Build the final query depending on the current route
    const queryWithJoin = this.buildQuery(similarityClause, filtersClause, currentRoute, bucketName);

    if (!queryWithJoin) return [];

    // Step 4: Prepare parameters for query execution
    const selectedProduct = (productId && productSource === "Internal")
      ? await this.getProductById(productId)
      : null;

    const parameters = {
      category: selectedProduct?.category,
      tags: selectedProduct?.tags.map(tag => tag.toLowerCase()) || [],
      minPrice: selectedProduct?.price ? selectedProduct.price * 0.8 : undefined,
      maxPrice: selectedProduct?.price ? selectedProduct.price * 1.2 : undefined,
      brandFK: selectedProduct?.FK_Brands,
      filterCategory: filters.category,
      filterCountry: filters.country,
      filterMinPrice: filters.minPrice,
      filterMaxPrice: filters.maxPrice,
      filterBrandName: filters.brand,
      filterName: filters.name,
      filterBrand: filters.brand,
      filterTags: filters.tags || [],
    };

    // Step 5: Execute query and return results
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

  // ========================================================================
  // ======================== USERS FUNCTIONS
  // ========================================================================
  /**
   * @brief Retrieves all users from the database.
   * @returns {Promise<any[]>} Array of users.
   * @throws {InternalServerErrorException} In case of error.
   */
  async getAllUsers(): Promise<any[]> {
    try {
      const bucketName = process.env.USER_BUCKET_NAME;
      if (!this.cluster) {
        console.error("❌ Cluster not initialized");
        throw new Error("Cluster not initialized");
      }

      // Query to fetch all users with a defined role
      const query = `
        SELECT META(u).id as id, u.*
        FROM \`${bucketName}\`._default._default u
        WHERE u.email IS NOT MISSING
        ORDER BY u.createdAt DESC
      `;

      // Execute the query
      const result = await this.cluster.query(query);

      // Check if users exist in the database
      if (!result?.rows?.length) {
        console.log("⚠️ No users found");
        return [];
      }

      // Map the results to a structured format
      return result.rows.map(row => ({
        id: row.id || `unknown_${Math.random().toString(36).substring(7)}`,
        email: row.email || 'unknown',
        username: row.username || 'unknown',
        role: row.role || 'user',
        createdAt: row.createdAt || new Date().toISOString(),
        updatedAt: row.updatedAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error("❌ Error retrieving users:", error);
      throw new InternalServerErrorException(`Error retrieving users: ${error.message}`);
    }
  }

  /**
   * @brief Updates a user's role in the database.
   * @param id User ID.
   * @param role New role to be assigned.
   * @returns {Promise<any>} Updated user data.
   */
  async updateUserRole(id: string, role: string): Promise<any> {
    try {
      if (!this.cluster) {
        throw new Error("Cluster not initialized");
      }
      const query = `
      UPDATE \`${process.env.USER_BUCKET_NAME}\`
      SET role = $role
      WHERE META().id = $id
      RETURNING META().id as id, email, username, role, createdAt, updatedAt;
    `;
      const result = await this.cluster.query(query, { parameters: { id, role } });
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error updating user role:", error);
      throw error;
    }
  }

  /**
   * @brief Deletes a user from the database.
   * @param id User ID.
   * @returns {Promise<boolean>} True if deleted, false otherwise.
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      if (!this.usersCollection) {
        throw new Error("Collection not initialized");
      }
      await this.usersCollection.remove(id);
      return true;
    } catch (error) {
      if (error.message.includes("document not found")) {
        return false;
      }
      console.error("❌ Error deleting user:", error);
      throw error;
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
   * @param role The role of the new user.
   *
   * @returns A Promise that resolves to the result of the insertion query, or null if the user already exists.
   *
   * @throws InternalServerErrorException If there is an error during the insertion process.
   */
  async addUser(
    username: string,
    email: string,
    password: string,
    role?: UserRole,
  ): Promise<any> {
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
        role: role || UserRole.USER, // Use provided role or default to User
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Log the new user object
      console.log("👤 New user being created:", {
        ...newUser,
        password: "****",
      });

      // Generate a unique identifier for the user document
      const userId = `user::${email}`; // Unique ID based on the email

      // Construct the N1QL query to insert the user
      const query = `
      INSERT INTO \`${this.usersBucket.name}\`._default._default (KEY, VALUE)
      VALUES ($userId, $newUser)
      `;

      // Execute the query with the parameters
      const result = await this.cluster.query(query, {
        parameters: { userId, newUser },
      });

      // Retrieve inserted user for verification
      const selectQuery = `
      SELECT * FROM \`${this.usersBucket.name}\`._default._default
      WHERE email = $email
      `;

      const selectResult = await this.cluster.query(selectQuery, {
        parameters: { email },
      });

      return selectResult.rows[0]._default || null; // Return inserted user
    } catch (error) {
      console.error("❌ Error occurred while adding the user:", error);
      throw new InternalServerErrorException(
        "Error occurred while adding the user.",
      );
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
      // Ensure that the users bucket is initialized before querying
      if (!this.usersBucket) {
        throw new Error("❌ Users bucket is not initialized.");
      }

      // Construct the unique document ID for the user based on their email
      const userId = `user::${email}`;
      const collection = this.getUsersCollection();
      const result = await collection.get(userId);

      // Return the user data from the retrieved document
      return result.content;
    } catch (error) {
      // Handle the case where the document is not found
      if (error instanceof DocumentNotFoundError) {
        console.warn(`⚠️ User with email "${email}" not found.`);
        return null;
      }
      console.error("❌ Error retrieving user by email:", error);
      throw new InternalServerErrorException("Error retrieving user by email.");
    }
  }

  // ========================================================================
  // ======================== PRODUCTS FUNCTIONS
  // ========================================================================
  /**
   * @brief Adds a new product, handling validation and brand management.
   * @param payload The product and brand data to be inserted.
   * @return Promise<any> Resolves if successful, throws an error otherwise.
   */
  async addProduct(payload: any): Promise<any> {
    try {
      // Ensure the products bucket is initialized before proceeding
      if (!this.productsBucket) {
        throw new InternalServerErrorException("❌ Products bucket is not initialized.");
      }

      // Extract product and newBrand from the payload
      const { product, newBrand } = payload;

      // Define the required fields and check for missing ones
      const requiredFields = ["name", "description", "category", "tags", "ecoscore", "origin", "source", "status"];
      const missingFields = requiredFields.filter((field) => !product[field]);
      if (missingFields.length > 0) {
        console.error("❌ Missing required fields:", missingFields);
        throw new BadRequestException(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Validate that 'tags' is an array
      if (!Array.isArray(product.tags)) {
        throw new BadRequestException("❌ 'tags' must be an array of strings.");
      }

      // Ensure 'source' is either 'Internal' or 'OpenFoodFacts'
      if (!["Internal", "OpenFoodFacts"].includes(product.source)) {
        throw new BadRequestException("❌ 'source' must be either 'Internal' or 'OpenFoodFacts'.");
      }

      // Generate a unique ID if not provided
      const generatedId = uuidv4();
      product.id = product.id || product.barcode || generatedId;

      // Check if a product with the same ID already exists
      const existingProduct = await this.getProductById(product.id);
      if (existingProduct) {
        console.warn(`⚠️ A product with the ID "${product.id}" already exists.`);
        return null;
      }

      // Handle brand association: Check if the brand exists or add a new one
      let brandId = null;
      if (product.brand) {
        brandId = await this.checkBrand(product.brand);
      }
      if (!brandId && newBrand) {
        brandId = await this.addBrand(newBrand.name, newBrand.description);
      }
      product.FK_Brands = brandId || null;
      delete product.brand; // Remove the brand field as it's no longer needed

      // Create a new product object with timestamps
      const newProduct = {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Define the document key for the product
      const productId = product.id;

      // Construct the N1QL query to insert the new product
      const query = `INSERT INTO \`${this.productsBucket.name}\`._default._default (KEY, VALUE) VALUES ($productId, $newProduct)`;

      // Execute the query to insert the product into the database
      const result = await this.cluster.query(query, { parameters: { productId, newProduct } });

      // Return the result of the operation
      return result;
    } catch (error) {
      // Handle errors gracefully
      console.error("❌ Error occurred while adding the product:", error);
      throw new InternalServerErrorException("Error occurred while adding the product.");
    }
  }

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
   * @brief Retrieves a specific product from Couchbase by its ID.
   *
   * @param {string} productId - The ID of the product to retrieve.
   * @returns {Promise<any>} - The product details or `null` if not found.
   * @throws {Error} If the query execution fails.
   */
  async getProductById(productId: string): Promise<any> {
    const bucketName = this.productsBucket.name;

    try {
      const query = `
        SELECT META(p).id AS id, p.*
        FROM \`${bucketName}\`._default._default p
        WHERE META().id = $productId;
      `;

      const options = { parameters: { productId } };
      const result = await this.cluster.query(query, options);

      if (result.rows.length > 0) {
        console.log("✅ Product found:", result.rows[0]);
        return result.rows[0];
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
      const result = await this.cluster.query(query, {
        parameters: { brandName },
      });
      console.log("Query result:\n", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  /**
   * @brief Updates a product in the database.
   * 
   * @details This function updates an existing product's fields dynamically based on 
   * the provided `valueToUpdate` object. It ensures that the bucket exists, required 
   * parameters are provided, and the database connection is established before executing 
   * the update query.
   * 
   * @param {string} productId - The unique ID of the product to update.
   * @param {Record<string, any>} valueToUpdate - An object containing the fields to update.
   * 
   * @returns {Promise<any>} - A promise resolving to the updated product data.
   * 
   * @throws {Error} If the bucket is not available, required parameters are missing, or an error occurs during execution.
   */
  async updateProduct(productId: string, valueToUpdate: Record<string, any>): Promise<any> {
    try {
      const productBucket = this.productsBucket.name;

      // Ensure the product bucket exists
      if (!productBucket) {
        console.error("❌ PRODUCT_BUCKET_NAME is not defined or bucket is unavailable");
        throw new Error("The product bucket is not defined or unavailable");
      }

      // Validate required parameters
      if (!productId) {
        console.error("❌ `productId` is required for product update");
        throw new Error("Product ID is required");
      }
      if (!valueToUpdate || Object.keys(valueToUpdate).length === 0) {
        console.error("❌ No fields provided for update");
        throw new Error("No update fields provided");
      }
      // Ensure Couchbase cluster connection is established
      if (!this.cluster) {
        console.error("❌ Couchbase cluster is not initialized");
        throw new Error("Couchbase connection is not established");
      }

      // Dynamically construct the fields to update in the query
      const setClauses = Object.keys(valueToUpdate)
        .map(key => `${key} = $${key}`)
        .join(", ");

      // Construct the Couchbase update query
      const query = `
          UPDATE \`${productBucket}\`._default._default
          SET ${setClauses}
          WHERE META().id = $productId
          RETURNING *;
      `;

      // Execute the query with parameterized values
      const result = await this.cluster.query(query, {
        parameters: { productId, ...valueToUpdate }
      });

      // Verify that the product was successfully updated
      if (!result.rows || result.rows.length === 0) {
        console.warn("⚠️ No product was updated. Ensure the provided ID exists.");
        throw new Error("No product was updated. Check the product ID.");
      }

      return { success: true, message: "Product successfully updated", data: result.rows[0] };
    } catch (error) {
      console.error("❌ Error updating product:", error.message || error);
      throw new Error("Error updating product");
    }
  }

  // ========================================================================
  // ======================== BRANDS FUNCTIONS
  // ========================================================================
  /**
   * @brief Checks if a brand exists in the database.
   * @param brandName The name of the brand to check.
   * @return Promise<string | null> Returns the brand ID if found, otherwise null.
   */
  async checkBrand(brandName: string): Promise<string | null> {
    try {
      // Retrieve all existing brands from the database
      const existingBrands = await this.getAllBrand();

      // Find a brand that matches the given name (case insensitive)
      const existingBrand = existingBrands.find(
        brand => brand.name.toLowerCase() === brandName.toLowerCase()
      );

      // Return the brand ID if found, otherwise return null
      return existingBrand ? existingBrand.id : null;
    } catch (error) {
      // Log the error for debugging
      console.error("❌ Error checking brand existence:", error);

      // Throw an internal server error exception
      throw new InternalServerErrorException("Error checking brand existence.");
    }
  }

  /**
   * @brief Adds a new brand to the database.
   * @param brandName The name of the new brand.
   * @param brandDescription The description of the new brand.
   * @return Promise<string> Returns the generated brand ID.
   */
  async addBrand(brandName: string, brandDescription: string): Promise<string> {
    try {
      // Generate a unique brand ID using UUID
      const brandId = `brand::${uuidv4()}`;

      // Construct the brand object with provided details
      const newBrand = {
        id: brandId,
        name: brandName,
        description: brandDescription || "",  // Use empty string if no description is provided
        status: 'AddedByUser',                // Default status for newly added brands
        createdAt: new Date().toISOString()   // Store the creation timestamp
      };

      // Define the N1QL query to insert the brand into the database
      const query =
        `INSERT INTO \`${this.brandBucket.name}\`._default._default (KEY, VALUE) 
      VALUES ($brandId, $newBrand)`;

      // Execute the query with the given parameters
      await this.cluster.query(query, { parameters: { brandId, newBrand } });

      // Return the newly created brand's ID
      return brandId;
    } catch (error) {
      // Log the error details for debugging
      console.error("❌ Error adding brand:", error);

      // Throw an internal server error exception
      throw new InternalServerErrorException("Error adding brand.");
    }
  }

  /**
   * @brief Retrieves all available brands.
   * @return Promise<{ id: string; name: string }[]> List of brands.
   */
  async getAllBrand(): Promise<{ id: string; name: string }[]> {
    try {
      // Check if the database cluster is initialized
      if (!this.cluster) {
        console.log("⚠️ Cluster not initialized, attempting to reconnect...");
        await this.initializeConnections();
        if (!this.cluster) {
          console.error("❌ Failed to initialize cluster connection");
          throw new Error("Failed to initialize cluster connection");
        }
      }

      // Retrieve the brand bucket name from environment variables
      const brandBucketName = process.env.BRAND_BUCKET_NAME;
      if (!brandBucketName) {
        console.error("❌ BRAND_BUCKET_NAME not defined in environment variables");
        throw new Error("BRAND_BUCKET_NAME not defined in environment variables");
      }

      // Define the query to fetch brand data from the database
      const query = `SELECT META(b).id AS id, b.name AS name FROM \`${brandBucketName}\`._default._default b ORDER BY b.name`;

      // Execute the query
      const result = await this.cluster.query(query);

      // Check if the query returned any rows, if not, return an empty array
      if (!result.rows || result.rows.length === 0) {
        console.log("⚠️ No brands found, returning empty array");
        return [];
      }

      // Map the retrieved rows to an array of objects containing brand IDs and names
      return result.rows.map(row => ({ id: row.id, name: row.name }));
    } catch (error) {
      // Log the error details for debugging
      console.error("❌ Error retrieving brands:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Return an empty array in case of an error to avoid breaking the application
      return [];
    }
  }

  // ========================================================================
  // ======================== REQUESTS FUNCTIONS (FOR ADMIN MANAGEMENT)
  // ========================================================================
  /**
   * @brief Retrieves product requests with associated brand names.
   * 
   * This function fetches product data from the products bucket and associates 
   * them with their respective brands from the brands bucket using a LEFT JOIN.
   * Only products with specific statuses ("add-product", "edit-product", "delete-product") 
   * are retrieved.
   * 
   * @return {Promise<any[]>} - A promise that resolves to an array of product requests.
   * @throws {InternalServerErrorException} - If an error occurs during retrieval.
   */
  async getRequests(): Promise<any[]> {
    try {
      const productBucket = this.productsBucket.name;
      const brandBucket = this.brandBucket.name;

      // Ensure bucket names are properly defined
      if (!productBucket || !brandBucket) {
        console.error("❌ Bucket names are not defined in environment variables");
        throw new Error("Bucket names are not defined");
      }

      // N1QL query to fetch product requests with associated brands.
      const query = `
          SELECT 
              META(p).id AS id,
              p.*,
              b.name AS brandName
          FROM \`${productBucket}\`._default._default p
          LEFT JOIN \`${brandBucket}\`._default._default b
          ON p.FK_Brands = META(b).id
          WHERE p.status IN ["add-product", "edit-product", "delete-product"]
      `;

      // Execute the query
      const result = await this.cluster.query(query);

      // Handle cases where no matching products are found
      if (!result.rows || result.rows.length === 0) {
        console.log("⚠️ No products found matching the specified statuses.");
        return [];
      }

      // Reformats the result to include the brand name.
      return result.rows.map(row => ({
        ...row,
        FK_Brands: row.brandName || "Unknown Brand", // Replace FK_Brands with brandName
      }));
    } catch (error) {
      console.error('❌ Error retrieving products with brands:', error);
      throw new InternalServerErrorException('Unable to retrieve product requests with brands');
    }
  }

}
