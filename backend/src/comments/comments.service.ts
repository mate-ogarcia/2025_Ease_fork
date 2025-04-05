import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
// Service
import { DatabaseService } from "../database/database.service";
import { CommentDto } from "./dto/comments.dto";
// Cache
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * @class CommentsService
 * @brief Service responsible for handling comment-related operations.
 */
@Injectable()
export class CommentsService {
  /**
   * @constructor
   * @brief Initializes the CommentsService with the required dependencies.
   * @param {DatabaseService} databaseService - Service for database interactions.
   */
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private databaseService: DatabaseService,
  ) { }

  /**
   * @brief Retrieves all comments from the cache or database with pagination.
   * @param {number} page - The page number to retrieve (starting from 1).
   * @param {number} pageSize - Number of comments per page.
   * @returns {Promise<any>} A promise containing the paginated list of comments and metadata.
   * @throws {InternalServerErrorException} If an error occurs while fetching comments.
   */
  async getAllComments(page: number = 1, pageSize: number = 10) {
    const cacheKey = `comments_page_${page}_size_${pageSize}`;
    
    try {
      // Try to fetch comments from cache first
      const cachedComments = await this.cacheManager.get(cacheKey);
      if (cachedComments) {
        console.log(`🚀 Cache hit for comments page ${page}`);
        return cachedComments;
      }
      
      console.log(`🧐 Cache miss for comments page ${page}, fetching from DB`);
      
      // If not in cache, fetch from database with pagination
      const skip = (page - 1) * pageSize;
      const [comments, totalCount] = await this.databaseService.getPaginatedComments(skip, pageSize);
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      const result = {
        comments,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };
      
      // Cache the paginated comments for 10 minutes
      await this.cacheManager.set(cacheKey, result, 600); // 600 -> TTL in seconds
      return result;
    } catch (error) {
      console.error("❌ Error retrieving comments:", error);
      throw new InternalServerErrorException("Error retrieving paginated comments.");
    }
  }

  /**
   * @brief Retrieves comments for a specific product with pagination.
   * @param {string} productId - The ID of the product.
   * @param {number} page - The page number to retrieve (starting from 1).
   * @param {number} pageSize - Number of comments per page.
   * @returns {Promise<any>} A promise containing the paginated product comments and metadata.
   * @throws {InternalServerErrorException} If an error occurs while fetching comments.
   */
  async getCommentsForProduct(productId: string, page: number = 1, pageSize: number = 10) {
    const cacheKey = `product_${productId}_comments_page_${page}_size_${pageSize}`;
    
    try {
      // Try to fetch from cache first
      const cachedComments = await this.cacheManager.get(cacheKey);
      if (cachedComments) {
        console.log(`🚀 Cache hit for product ${productId} comments page ${page}`);
        return cachedComments;
      }
      
      console.log(`🧐 Cache miss for product ${productId} comments page ${page}, fetching from DB`);
      
      // If not in cache, fetch from database with pagination
      const skip = (page - 1) * pageSize;
      const [comments, totalCount] = await this.databaseService.getProductComments(productId, skip, pageSize);
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Transformation : extraire chaque CommentsBDD
      const flatComments = comments.map((item: any) => item.CommentsBDD ?? item); // fallback si déjà plat      
      
      const result = {
        comments: flatComments,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };
      
      // Cache the paginated comments for 10 minutes
      await this.cacheManager.set(cacheKey, result, 600);
      return result;
    } catch (error) {
      console.error(`❌ Error retrieving comments for product ${productId}:`, error);
      throw new InternalServerErrorException("Error retrieving product comments.");
    }
  }

  /**
   * Creates a new comment and adds it to the database.
   *
   * @param {CommentDto} commentDto - The data transfer object containing the comment details.
   * @returns {Promise<Comment>} - A promise resolving to the created comment.
   * @throws {InternalServerErrorException} - If there is an error adding the comment.
   */
  async createComment(commentDto: CommentDto): Promise<any> {
    try {
      // Add the comment using the database service
      const newComment = await this.databaseService.addComment(commentDto);
      
      // Invalidate related cache keys
      await this.invalidateCommentCaches(commentDto.productId);
      
      return newComment;
    } catch (error) {
      // Log error and throw an internal server error if adding comment fails
      console.error("❌ Error adding comment:", error);
      throw new InternalServerErrorException("Error adding comment.");
    }
  }

  /**
   * Invalidates cache entries related to comments when a new comment is added.
   * This ensures that users see the most up-to-date data.
   * 
   * @param {string} productId - The ID of the product associated with the new comment.
   */
  // TODO
  private async invalidateCommentCaches(productId: string): Promise<void> {
    try {
      // Get all keys from cache that match certain patterns
      // Note: This implementation depends on Redis's KEYS command
      // For production, you might want to use a more efficient approach
      
      // Try to get Redis client from cache manager
      const store: any = this.cacheManager.stores;
      
      // Method 1: If cache manager exposes getClient
      if (store.getClient) {
        const client = store.getClient();
        
        // Invalidate general comment pages
        const commentPageKeys = await client.keys('comments_page_*');
        for (const key of commentPageKeys) {
          await this.cacheManager.del(key);
        }
        
        // Invalidate product specific comment pages
        const productCommentKeys = await client.keys(`product_${productId}_comments_*`);
        for (const key of productCommentKeys) {
          await this.cacheManager.del(key);
        }
        
        // Invalidate search results that might include this product
        const searchKeys = await client.keys('search_*');
        for (const key of searchKeys) {
          await this.cacheManager.del(key);
        }
      } else {
        // Method 2: Fallback - reset the entire cache
        // This is less efficient but more compatible
        console.log('⚠️ Cache client not accessible, invalidating all cache');
        // Some cache managers expose reset()
        if (typeof store.reset === 'function') {
          await store.reset();
        } else {
          // As last resort, delete known keys
          await this.cacheManager.del('all_comments');
          // If you know specific key patterns, you could try to delete them directly
        }
      }
      
      console.log('🧹 Comment caches invalidated successfully');
    } catch (error) {
      console.error('⚠️ Error invalidating comment caches:', error);
      // Don't throw here, just log the error
    }
  }
}