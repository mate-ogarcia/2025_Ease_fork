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
} from "@nestjs/common";
import {
  Bucket,
  Cluster,
  Collection,
  connect,
  SearchQuery,
  HighlightStyle,
} from "couchbase";
import * as fs from "fs";
// HTTP
import { HttpService } from "@nestjs/axios";
import { UserRole } from "../auth/enums/role.enum";
import * as dotenv from "dotenv";

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
      const query = `
        SELECT META(u).id as id, u.*
        FROM \`${this.usersBucket.name}\`._default._default u 
        WHERE u.email = $email
      `;

      // Executing query with secured settings
      const result = await this.cluster.query(query, { parameters: { email } });

      if (result.rows.length === 0) {
        console.warn(`⚠️ User with email "${email}" not found.`);
        return null;
      }

      // Return the user data with the bucket name as key and include the document ID
      const userData = result.rows[0];
      return {
        [this.usersBucket.name]: {
          id: userData.id,
          ...userData,
        },
      };
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

      // Return the result of the insertion
      return result;
    } catch (error) {
      console.error("❌ Error occurred while adding the user:", error);
      throw new InternalServerErrorException(
        "Error occurred while adding the user.",
      );
    }
  }

  /**
   * @function getAllCategName
   * @description Retrieves all category names from the Couchbase database
   * @details This function executes a N1QL query to fetch all category names.
   * It includes enhanced error handling and logging to diagnose connection issues.
   *
   * @returns {Promise<any[]>} A promise that resolves with an array of category names or empty array on error
   */
  async getAllCategName(): Promise<any[]> {
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

      const query = `
        SELECT DISTINCT c.name
        FROM ease._default.categorie c
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

  /**
   * @function getAllBrandName
   * @description Retrieves all brand names from the Couchbase database
   * @details This function executes a N1QL query to fetch all brand names.
   * It includes enhanced error handling and logging to diagnose connection issues.
   *
   * @returns {Promise<any[]>} A promise that resolves with an array of brand names or empty array on error
   */
  async getAllBrandName(): Promise<any[]> {
    try {
      console.log("🔍 Attempting to retrieve all brand names...");

      if (!this.cluster) {
        console.log("⚠️ Cluster not initialized, attempting to reconnect...");
        await this.initializeConnections();

        if (!this.cluster) {
          console.error("❌ Failed to initialize cluster connection");
          throw new Error("Failed to initialize cluster connection");
        }
      }

      const query = `
        SELECT DISTINCT b.name
        FROM ease._default.brand b
        ORDER BY b.name`;

      console.log("🔍 Executing query:", query);

      const result = await this.cluster.query(query);
      console.log(
        `✅ Brands retrieved successfully: ${result.rows.length} brands found`,
      );

      // Return empty array if no results
      if (!result.rows || result.rows.length === 0) {
        console.log("⚠️ No brands found, returning empty array");
        return [];
      }

      return result.rows;
    } catch (error) {
      console.error("❌ Error retrieving brands:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Return empty array on error to avoid blocking the UI
      return [];
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
   * @brief Retrieves products based on provided filters and/or similarity to a selected product.
   *
   * @details
   * This function dynamically constructs a N1QL query to fetch products that either:
   * - Match the provided filters (e.g., category, country, price range, brand), OR
   * - Are similar to a selected product (based on category, tags, price range, and brand).
   *
   * ### Query Logic:
   * - **With `productId`:** Searches for products similar to the selected product using:
   *   - Category match
   *   - Shared tags
   *   - Price range within ±20% of the selected product's price
   *   - Same brand association (via `FK_Brands`)
   * - **Without `productId`:** Filters products directly based on provided filters.
   * - **Combined case:** If both `productId` and filters are provided, products must satisfy either similarity conditions or provided filters.
   *
   * @param filters An object containing search filters. Possible fields:
   * - `category` (string): Category to filter products by.
   * - `country` (string): Country of origin to filter products by.
   * - `minPrice` (number): Minimum price for filtering.
   * - `maxPrice` (number): Maximum price for filtering.
   * - `brand` (string, optional): Brand to filter products by.
   * - `productId` (string, optional): ID of a selected product to find similar products.
   *
   * @returns {Promise<any[]>} An array of products matching the filters and/or similarity criteria.
   *
   * @throws {InternalServerErrorException} Thrown if there is an error during query construction or execution.
   */
  async getProductsWithFilters(filters: any): Promise<any[]> {
    const bucketName = this.productsBucket.name;
    const brandBucketName = this.brandBucket.name;

    try {
      if (Object.keys(filters).length === 0) {
        throw new Error("❌ Filters are empty");
      }

      const similarToFiltersConditions: string[] = [];
      let queryWithJoin = "";

      // ---------------------
      // Part 1: Similarity search based on a selected product (if productId is provided)
      // ---------------------
      if (filters.productId) {
        console.log(
          `🔎 Searching for products similar to: ${filters.productId}`,
        );

        const selectedProduct = await this.getProductById(filters.productId);
        if (!selectedProduct) {
          throw new Error(`❌ Product with ID ${filters.productId} not found.`);
        }

        console.log(`🔹 Selected product:`, selectedProduct);

        // ---------------------
        // Similarity criteria based on the selected product's attributes
        // ---------------------
        const subSimilarityConditions: string[] = [];

        // Match products with the same category
        if (selectedProduct.category) {
          subSimilarityConditions.push(
            `category = '${selectedProduct.category}'`,
          );
        }

        // Match products with at least one similar tag
        if (selectedProduct.tags?.length) {
          subSimilarityConditions.push(
            `ANY tag IN tags SATISFIES tag IN ${JSON.stringify(selectedProduct.tags)} END`,
          );
        }

        // Match products within ±20% price range of the selected product
        if (selectedProduct.price) {
          const minPrice = selectedProduct.price * 0.8;
          const maxPrice = selectedProduct.price * 1.2;
          subSimilarityConditions.push(
            `price BETWEEN ${minPrice} AND ${maxPrice}`,
          );
        }

        // Add brand filter directly if product has a FK_Brands
        if (selectedProduct.FK_Brands) {
          console.log(
            "🔎 Using brand from selected product:",
            selectedProduct.FK_Brands,
          );
          subSimilarityConditions.push(
            `FK_Brands = '${selectedProduct.FK_Brands}'`,
          );
        }

        console.log("✅ subSimilarityConditions:\n", subSimilarityConditions);

        // ---------------------
        // Part 2: Search based on directly provided filters
        // ---------------------
        if (filters.category)
          similarToFiltersConditions.push(`category = '${filters.category}'`);
        if (filters.country)
          similarToFiltersConditions.push(`origin = '${filters.country}'`);
        if (filters.minPrice && filters.maxPrice) {
          similarToFiltersConditions.push(
            `price BETWEEN ${filters.minPrice} AND ${filters.maxPrice}`,
          );
        } else if (filters.minPrice) {
          similarToFiltersConditions.push(`price >= ${filters.minPrice}`);
        } else if (filters.maxPrice) {
          similarToFiltersConditions.push(`price <= ${filters.maxPrice}`);
        }

        // If brand is provided (without a selected product), use getProductsByBrand to fetch FK_Brands
        if (filters.brand && !filters.productId) {
          const brandResult = await this.getProductsByBrand(filters.brand);
          if (brandResult?.length) {
            const brandFK = brandResult[0].FK_Brands; // Assumes getProductsByBrand returns FK_Brands
            if (brandFK) {
              similarToFiltersConditions.push(`FK_Brands = '${brandFK}'`);
            }
          }
        }

        console.log(
          "✅ similarToFiltersConditions:\n",
          similarToFiltersConditions,
        );

        // ---------------------
        // Query construction combining similarity and filter conditions
        // ---------------------
        const similarityClause =
          subSimilarityConditions.length > 0
            ? `(${subSimilarityConditions.join(" AND ")})`
            : "";
        const filtersClause =
          similarToFiltersConditions.length > 0
            ? `(${similarToFiltersConditions.join(" AND ")})`
            : "";

        if (similarityClause && filtersClause) {
          queryWithJoin = `
            SELECT * FROM \`${bucketName}\`
            WHERE ${similarityClause} OR ${filtersClause}
          `;
        } else if (similarityClause) {
          queryWithJoin = `
            SELECT * FROM \`${bucketName}\`
            WHERE ${similarityClause}
          `;
        } else if (filtersClause) {
          queryWithJoin = `
            SELECT * FROM \`${bucketName}\`
            WHERE ${filtersClause}
          `;
        }
      } else {
        // ---------------------
        // No productId provided: Apply only the provided filters
        // ---------------------
        if (filters.category)
          similarToFiltersConditions.push(`category = '${filters.category}'`);
        if (filters.country)
          similarToFiltersConditions.push(`origin = '${filters.country}'`);
        if (filters.minPrice && filters.maxPrice) {
          similarToFiltersConditions.push(
            `price BETWEEN ${filters.minPrice} AND ${filters.maxPrice}`,
          );
        }

        // Add brand filter with subquery
        if (filters.brand) {
          console.log(
            `🔎 Adding brand filter with subquery for brand: ${filters.brand}`,
          );

          const brandSubquery = `
            (SELECT RAW META(b).id FROM \`${brandBucketName}\` b WHERE b.name = '${filters.brand}' LIMIT 1)
          `;

          similarToFiltersConditions.push(`FK_Brands = ${brandSubquery}`);
        }

        // ---------------------
        // building the final request
        // ---------------------
        if (similarToFiltersConditions.length > 0) {
          queryWithJoin = `
            SELECT * FROM \`${bucketName}\`
            WHERE ${similarToFiltersConditions.join(" OR ")}
          `;
        }
      }

      // ---------------------
      // Execute the constructed query
      // ---------------------
      let combinedResults: any[] = [];

      if (queryWithJoin) {
        console.log(
          `🔹 Executing combined similarity and filters query: ${queryWithJoin}`,
        );
        const resultCombined = await this.cluster.query(queryWithJoin);
        combinedResults = resultCombined.rows.map((row) => row[bucketName]);
      }
      console.log(`📦 Total combined products: ${combinedResults.length}`);
      return combinedResults;
    } catch (error) {
      console.error("❌ Error retrieving filtered products:", error);
      throw new InternalServerErrorException(
        "An error occurred while retrieving the filtered products.",
      );
    }
  }

  /**
   * @brief Retrieves all users from the database.
   * @details Executes a N1QL query to fetch all users from the users bucket.
   *
   * @returns {Promise<any[]>} Array of user objects.
   * @throws {InternalServerErrorException} If an error occurs during retrieval.
   */
  async getAllUsers(): Promise<any[]> {
    try {
      if (!this.cluster) {
        throw new Error("❌ Cluster not initialized");
      }

      console.log("🔍 Récupération de tous les utilisateurs...");
      console.log("📦 Bucket name:", process.env.USER_BUCKET_NAME);

      const query = `
        SELECT u.*, META(u).id as docId
        FROM \`${process.env.USER_BUCKET_NAME}\`._default._default u
        WHERE META(u).id LIKE 'user::%'
      `;

      console.log("🔍 Exécution de la requête:", query);

      const result = await this.cluster.query(query);

      if (!result || !result.rows) {
        console.warn("⚠️ Aucun résultat retourné par la requête");
        return [];
      }

      const users = result.rows.map((user) => ({
        id: user.docId,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      console.log(`✅ ${users.length} utilisateurs trouvés`);
      console.log(
        "👥 Premier utilisateur (exemple):",
        users[0] || "Aucun utilisateur",
      );

      return users;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des utilisateurs:",
        error,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération de la liste des utilisateurs",
      );
    }
  }

  async updateUserRole(id: string, role: UserRole): Promise<any> {
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

      const result = await this.cluster.query(query, {
        parameters: { id, role },
      });
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error updating user role in database:", error);
      throw error;
    }
  }

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
      console.error("❌ Error deleting user from database:", error);
      throw error;
    }
  }
}
