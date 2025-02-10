import { Injectable, OnModuleInit } from '@nestjs/common';
import * as couchbase from 'couchbase';
// Use of .env
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private cluster!: couchbase.Cluster; // TODO
  private bucket!: couchbase.Bucket;

  constructor(private readonly configService: ConfigService) { }

  /**
   * Called when the module is initialized.
   * Connects to the Couchbase database.
   */
  async onModuleInit() {
    await this.connectToDatabase();
  }

  /**
   * Establishes a connection to the Couchbase database.
   * 
   * This method retrieves database credentials and connection details from environment variables.
   * It connects to the Couchbase cluster and initializes the bucket.
   * 
   * /!\ The IP should be the one of the machine hosting the DB.
   */
  private async connectToDatabase() {
    try {
      console.log('🟡 Connecting to Couchbase...');
      const ipCouchbase = this.configService.get<string>('IP_COUCHBASE');
      const username = this.configService.get<string>('DB_USER', 'default_user');
      const password = this.configService.get<string>('DB_PASSWORD', 'default_password');
      const bucketName = this.configService.get<string>('BUCKET_NAME');
      this.cluster = await couchbase.connect(ipCouchbase, {
        username,
        password,
      });

      this.bucket = this.cluster.bucket(bucketName);
      console.log('✅ Successfully connected to Couchbase!');
    } catch (error) {
      console.error('❌ Connection error to Couchbase:', error);
      throw new Error('Unable to connect to Couchbase');
    }
  }

  /**
   * Retrieves the bucket object from the Couchbase cluster.
   * 
   * @returns {couchbase.Bucket} The initialized bucket object.
   * @throws {Error} If the bucket has not been initialized yet.
   */
  getBucket() {
    if (!this.bucket) {
      throw new Error('Couchbase bucket is not initialized yet.');
    }
    return this.bucket;
  }

  /**
   * Retrieves the default collection from the bucket.
   * 
   * @returns {couchbase.Collection} The default collection of the initialized bucket.
   * @throws {Error} If the bucket has not been initialized yet.
   */
  getCollection() {
    if (!this.bucket) {
      throw new Error('Couchbase bucket is not initialized yet.');
    }
    return this.bucket.defaultCollection();
  }

  /**
   * Retrieves all data from the Couchbase database using a N1QL query.
   * 
   * This method executes a query on the specified bucket to fetch all the data entries.
   * In case of an error, it returns an empty array.
   * 
   * @returns {Promise<any[]>} A promise that resolves to an array of the data retrieved.
   */
  async getAllData(): Promise<any[]> {
    const bucketName = this.configService.get<string>('BUCKET_NAME');

    try {
      const query = `SELECT * FROM \`${bucketName}\``; // N1QL query
      const result = await this.cluster.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error while retrieving data:', error);
      return [];
    }
  }

  /**
   * Executes a Full Text Search (FTS) query on the specified index in Couchbase.
   * 
   * This method performs an FTS query using a query string and returns the search results.
   * 
   * @param {string} searchQuery - The search query string to be executed.
   * @returns {Promise<any[]>} A promise that resolves to an array of the search results.
   * @throws {Error} If there is an error executing the FTS query.
   */
  async searchQuery(searchQuery: string): Promise<any[]> {
    const _indexName = this.configService.get<string>('INDEX_NAME');
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
          fields: ["name", "category", "tags"],
          highlight: { style: couchbase.HighlightStyle.HTML, fields: ["name", "category", "tags"] }
        }
      );
  
      return searchRes.rows;
    } catch (error) {
      console.error('Error FTS:', error);
      throw error;
    }
  }
  
   
}
