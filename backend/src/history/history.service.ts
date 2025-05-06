/**
 * @file history.service.ts
 * @brief Service for managing search history operations in the Couchbase database
 *
 * This service handles CRUD operations for user search history,
 * using the database service to interact with Couchbase.
 * Repeated searches are preserved in the history (no deduplication).
 */

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * @interface HistoryItem
 * @brief Interface representing a search history item
 */
export interface HistoryItem {
  id?: string;
  _id?: string;
  userId: string;
  productId: string;
  productName: string;
  searchDate: string;
  productData?: any;
  _default?: {
    id?: string;
    _id?: string;
    [key: string]: any;
  };
  [key: string]: any; // To allow other dynamic properties
}

/**
 * @class HistoryService
 * @brief Service for managing search history operations
 */
@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly bucketName = 'SearchHistoryBDD';

  /**
   * @brief Constructor for the history service
   * @param databaseService Database service for accessing Couchbase
   */
  constructor(private readonly databaseService: DatabaseService) {
    this.logger.log(`🔍 HistoryService initialized - Bucket: ${this.bucketName}`);
  }

  /**
   * @brief Adds a new item to the search history
   * @param historyData Data of the history item to add
   * @returns The added history item
   */
  async addToHistory(historyData: HistoryItem): Promise<any> {
    this.logger.log('🔍 Starting addToHistory');
    this.logger.debug(`🔍 Received data: userId=${historyData.userId}, productId=${historyData.productId}, productName=${historyData.productName}`);

    try {
      // Generate a new unique ID for each history entry
      // This allows keeping duplicates as each search gets a different ID
      const historyId = uuidv4();
      this.logger.log(`🔍 Generated ID for history: ${historyId}`);

      // Enrich the history item with timestamps and a unique ID
      const historyItem = {
        ...historyData,
        id: historyId,
        searchDate: new Date().toISOString(), // Use current time for chronological sorting
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.logger.log('🔍 Attempting to insert into dedicated history collection');

      // Insert the history item into the dedicated history collection
      try {
        const collection = this.databaseService.getHistoryCollection();
        this.logger.log('✅ History collection successfully retrieved');

        await collection.insert(historyId, historyItem);
        this.logger.log('✅ Document successfully inserted into history collection');

        // Return the created item
        return { id: historyId, ...historyItem };
      } catch (insertError) {
        this.logger.error(`❌ Error during insertion: ${insertError.message}`, insertError.stack);
        throw insertError;
      }
    } catch (error) {
      this.logger.error(`❌ Error in addToHistory: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error adding to search history');
    }
  }

  /**
   * @brief Retrieves the search history of a specific user
   * @param userId User ID
   * @returns List of user's history items, sorted by date (most recent first)
   */
  async getUserHistory(userId: string): Promise<HistoryItem[]> {
    this.logger.log(`🔍 Starting getUserHistory for userId: ${userId}`);

    try {
      this.logger.log('🔍 Preparing N1QL query');

      // Use the same bucket as the one used for insertion
      const historyBucketName = this.databaseService.getHistoryBucket().name;
      this.logger.log(`🔍 Using bucket: ${historyBucketName}`);

      // Query that retrieves all entries for a user, including duplicates
      // Sorted by search date in descending order (most recent first)
      const query = `
        SELECT *
        FROM \`${historyBucketName}\`._default._default
        WHERE userId = $userId
        ORDER BY searchDate DESC
      `;

      this.logger.log(`🔍 N1QL query prepared: ${query}`);
      this.logger.log('🔍 Executing query via executeQuery');

      try {
        // Execute the query via the executeQuery method of DatabaseService
        const results = await this.databaseService.executeN1qlQuery(query, { userId });
        this.logger.log(`✅ Query executed successfully. ${results.length} results obtained.`);

        // Log the found documents for analysis
        if (results.length > 0) {
          this.logger.log(`✅ Documents found: ${JSON.stringify(results).substring(0, 500)}...`);
        }

        return results;
      } catch (queryError) {
        this.logger.error(`❌ Error executing query: ${queryError.message}`, queryError.stack);
        throw queryError;
      }
    } catch (error) {
      this.logger.error(`❌ Error in getUserHistory: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving search history');
    }
  }

  /**
   * @brief Deletes a specific history item
   * @param historyId ID of the history item to delete
   * @returns Confirmation of deletion
   */
  async deleteHistoryItem(historyId: string): Promise<any> {
    this.logger.log(`🔍 Starting deleteHistoryItem for historyId: ${historyId}`);

    try {
      this.logger.log('🔍 Retrieving history collection');

      try {
        // Delete the history item directly from the collection
        const collection = this.databaseService.getHistoryCollection();
        this.logger.log('✅ History collection successfully retrieved');

        await collection.remove(historyId);
        this.logger.log('✅ Document successfully deleted');

        return { success: true, id: historyId };
      } catch (removeError) {
        this.logger.error(`❌ Error during deletion: ${removeError.message}`, removeError.stack);
        throw removeError;
      }
    } catch (error) {
      this.logger.error(`❌ Error in deleteHistoryItem: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error deleting history item');
    }
  }

  /**
   * @brief Clears all history of a specific user
   * @param userId User ID
   * @returns Confirmation of deletion
   */
  async clearUserHistory(userId: string): Promise<any> {
    this.logger.log(`🔍 Starting clearUserHistory for userId: ${userId}`);

    try {
      // Use a direct N1QL query to delete all documents of the user
      const historyBucketName = this.databaseService.getHistoryBucket().name;

      // N1QL query to directly delete all documents of the user
      const query = `
        DELETE FROM \`${historyBucketName}\`._default._default
        WHERE userId = $userId
        RETURNING META().id as deleted_id
      `;

      this.logger.log(`🔍 Executing N1QL query: ${query}`);

      // Execute the query with the userId parameter
      const deleteResult = await this.databaseService.executeN1qlQuery(query, { userId });

      this.logger.log(`✅ N1QL deletion successful: ${deleteResult.length} items deleted`);

      // Return the result with the number of deleted items
      return {
        success: true,
        deleted: deleteResult.length,
        ids: deleteResult.map(item => item.deleted_id || 'unknown')
      };
    } catch (error) {
      this.logger.error(`❌ Error in clearUserHistory: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error deleting history');
    }
  }

  /**
   * @brief Retrieves paginated search history for a specific user
   * @param userId User ID
   * @param page Page number (starts at 1)
   * @param limit Number of items per page
   * @returns Object containing paginated history items and total count
   */
  async getPaginatedUserHistory(userId: string, page: number = 1, limit: number = 10): Promise<{ items: HistoryItem[], total: number }> {
    this.logger.log(`🔍 Starting getPaginatedUserHistory for userId: ${userId}, page: ${page}, limit: ${limit}`);

    try {
      const historyBucketName = this.databaseService.getHistoryBucket().name;
      const offset = (page - 1) * limit;

      // First query to get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM \`${historyBucketName}\`._default._default
        WHERE userId = $userId
      `;

      // Second query to get paginated results
      const dataQuery = `
        SELECT *
        FROM \`${historyBucketName}\`._default._default
        WHERE userId = $userId
        ORDER BY searchDate DESC
        LIMIT $limit
        OFFSET $offset
      `;

      const [countResult, items] = await Promise.all([
        this.databaseService.executeN1qlQuery(countQuery, { userId }),
        this.databaseService.executeN1qlQuery(dataQuery, { userId, limit, offset })
      ]);

      const total = countResult[0]?.total || 0;
      this.logger.log(`✅ Retrieved ${items.length} items out of ${total} total items`);

      return {
        items,
        total
      };
    } catch (error) {
      this.logger.error(`❌ Error in getPaginatedUserHistory: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving paginated search history');
    }
  }
}
