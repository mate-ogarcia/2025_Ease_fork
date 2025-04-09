/**
 * @file comments.controller.ts
 * @brief Controller for handling comment-related API endpoints.
 *
 * This controller provides endpoints to retrieve, search and add comments with pagination support.
 */
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Param,
  UseInterceptors,
  Inject,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentDto } from "./dto/comments.dto";
import { CacheTTL, Cache } from "@nestjs/cache-manager";
import { CustomCacheInterceptor } from "./CustomCacheInterceptor";

/**
 * @class CommentsController
 * @brief Controller responsible for managing comment-related API endpoints.
 * 
 * This class contains methods to retrieve comments for a product, with pagination support, and add new comments to the database.
 */
@Controller("comments")
export class CommentsController {
  /**
   * @constructor
   * @brief Initializes the CommentsController with the required services.
   * @param {CommentsService} commentsService - Service for handling comment-related operations.
   * @param {Cache} cacheManager - Cache manager for managing comment data caching.
   */
  constructor(
    private commentsService: CommentsService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) { }

  /**
   * @brief Retrieves comments for a specific product with pagination.
   * 
   * @route GET /comments/product/:productId
   * @param {string} productId - The ID of the product for which comments are retrieved.
   * @param {string} page - The page number to retrieve (optional, default: 1).
   * @param {string} pageSize - Number of comments per page (optional, default: 10).
   * @returns {Promise<any>} A promise containing the paginated list of comments for the product.
   * @throws {InternalServerErrorException} If an error occurs while fetching the comments.
   */
  @CacheTTL(5 * 60 * 1000) // Cache expired after 5 minutes
  @Get("product/:productId")
  @UseInterceptors(CustomCacheInterceptor) // Intercept the cache logic
  async getCommentsForProduct(
    @Param('productId') productId: string
  ) {
    try {
      // Call the service function to retrieve all comments
      return await this.commentsService.getCommentsForProduct(productId);
    } catch (error) {
      console.error(`❌ Error retrieving comments for product ${productId}:`, error);
      throw new InternalServerErrorException(`Error retrieving comments for product.`);
    }
  }

  /**
   * @brief Adds a new comment to the database.
   * 
   * This endpoint adds a new comment to the database. It also handles cache invalidation
   * by deleting the cache associated with the product to ensure that the newly added comment
   * is reflected in future requests.
   * 
   * @route POST /comments/add
   * @param {CommentDto} commentDto - The comment data object containing the comment's details.
   * @returns {Promise<any>} A promise containing the created comment.
   * @throws {InternalServerErrorException} If an error occurs while adding the comment.
   */
  @Post("add")
  async addComment(@Body() commentDto: CommentDto) {
    try {
      console.log(commentDto)
      // Add the comment to the database
      const newComment = await this.commentsService.createComment(commentDto);

      // Generate the cache key specific to the product (same logic as in the interceptor)
      const cacheKey = `product_${commentDto.productId}`;

      // Delete the cache to force refresh of the comments for the product
      const cacheExists = await this.cacheManager.get(cacheKey);
      if (cacheExists) {
        await this.cacheManager.del(cacheKey);
      }

      return newComment;
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      throw new InternalServerErrorException("Error adding comment.");
    }
  }

  /**
   * @brief Retrieves the total count of comments for a specific product.
   * 
   * This method queries the `CommentsService` to retrieve the total number of comments for a product 
   * identified by the given `productId`. The count is returned as part of the response. 
   * If an error occurs while fetching the count, an `InternalServerErrorException` is thrown.
   * 
   * @route GET /comments/product/:productId/count
   * @param {string} productId - The ID of the product for which the comment count is retrieved.
   * @returns {Promise<any>} A promise containing the total count of comments for the product.
   * @throws {InternalServerErrorException} If an error occurs while retrieving the comment count.
   */
  @Get("product/:productId/count")
  async getCommentsCount(@Param("productId") productId: string) {
    try {
      // Call the service method to get the total comment count for this product
      const commentCount = await this.commentsService.getCommentsCount(productId);

      // Return the comment count
      return { count: commentCount };
    } catch (error) {
      console.error(`❌ Error retrieving comments count for the product ${productId}:`, error);
      throw new InternalServerErrorException(`Error retrieving comments count for the product ${productId}.`);
    }
  }

  /**
   * @brief Retrieves the average user rating for a specific product.
   *
   * This route handler calls the service to compute the average rating (`userRatingCom`)
   * of all comments associated with the given product ID.
   *
   * @param productId - The unique identifier of the product (from route parameter).
   * @returns An object containing the average rating as `count`.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  @Get("product/:productId/average")
  async getCommentsAverageRate(@Param("productId") productId: string) {
    try {
      const commentAvg = await this.commentsService.getCommentsAverageRate(productId);
      return { avg: commentAvg };
    } catch (error) {
      console.error(`❌ Error retrieving average rate for the product ${productId}:`, error);
      throw new InternalServerErrorException(`Error retrieving average rate for the product ${productId}.`);
    }
  }
}
