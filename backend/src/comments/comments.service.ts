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
   * @brief Retrieves all comments from the cache or database.
   * @returns {Promise<any>} A promise containing the list of all comments.
   * @throws {InternalServerErrorException} If an error occurs while fetching comments.
   */
  // TODO trying to use redis for the cache
  async getAllComments() {
    const cacheKey = 'all_comments';

    try {
      // Try to fetch comments from cache first
      const cachedComments = await this.cacheManager.get(cacheKey);
      if (cachedComments) {
        console.log('🚀 Cache hit for comments');
        return cachedComments;
      }

      console.log('🧐 Cache miss for comments, fetching from DB');
      // If not in cache, fetch from database
      const comments = await this.databaseService.getAllComments();
      
      // Cache the comments for 10 minutes
      await this.cacheManager.set(cacheKey, comments, 600); // 600 -> TTL in seconds

      return comments;
    } catch (error) {
      console.error("❌ Error retrieving comments:", error);
      throw new InternalServerErrorException("Error retrieving comments.");
    }
  }

  // TODO fetch all the comments for a product
  // async getCommentsForProduct(productId: string, page: number, pageSize: number): Promise<Comment[]> {


  /**
   * Creates a new comment and adds it to the database.
   * 
   * @param {CommentDto} commentDto - The data transfer object containing the comment details.
   * @returns {Promise<Comment>} - A promise resolving to the created comment.
   * @throws {InternalServerErrorException} - If there is an error adding the comment.
   */
  async createComment(commentDto: CommentDto): Promise<Comment> {
    try {
      // Add the comment using the database service
      const newComment = await this.databaseService.addComment(commentDto);

      // Invalidate the cache so the new comment is fetched on the next request
      await this.cacheManager.del('all_comments');

      return newComment;
    } catch (error) {
      // Log error and throw an internal server error if adding comment fails
      console.error("❌ Error adding comment:", error);
      throw new InternalServerErrorException("Error adding comment.");
    }
  }
}
