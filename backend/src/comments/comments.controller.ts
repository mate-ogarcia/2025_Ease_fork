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
  Param,
  Delete,
  Put,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentDto } from "./dto/comments.dto";

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
  constructor(private commentsService: CommentsService) {}

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
  @Get("product/:productId")
  async getCommentsForProduct(@Param("productId") productId: string) {
    try {
      // Call the service function to retrieve all comments
      return await this.commentsService.getCommentsForProduct(productId);
    } catch (error) {
      console.error(
        `❌ Error retrieving comments for product ${productId}:`,
        error
      );
      throw new InternalServerErrorException(
        `Error retrieving comments for product.`
      );
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
      console.log(commentDto);
      // Add the comment to the database
      const newComment = await this.commentsService.createComment(commentDto);

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
      const commentCount =
        await this.commentsService.getCommentsCount(productId);

      // Return the comment count
      return { count: commentCount };
    } catch (error) {
      console.error(
        `❌ Error retrieving comments count for the product ${productId}:`,
        error
      );
      throw new InternalServerErrorException(
        `Error retrieving comments count for the product ${productId}.`
      );
    }
  }

  /**
   * @brief Deletes a comment from the database.
   *
   * This endpoint allows the deletion of a comment identified by its unique ID.
   * It also handles cache invalidation by deleting the cache associated with the product
   * to ensure that the deleted comment is not reflected in future requests.
   */
  @Delete(":id")
  async deleteComment(@Param("id") id: string) {
    try {
      // Call the service method to delete the comment
      const deletedComment =  await this.commentsService.deleteComment(id);
      return deletedComment;
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      throw new InternalServerErrorException("Error deleting comment.");
    }
  }

  /**
   * @brief Edits a comment in the database.
   *
   * This endpoint allows the editing of a comment identified by its unique ID.
   * It also handles cache invalidation by deleting the cache associated with the product
   * to ensure that the edited comment is not reflected in future requests.
   */  
  @Put(":id")
  async editComment(@Param("id") id: string, @Body() commentDto: CommentDto) {
    try {
      // Call the service method to edit the comment
      const editedComment = await this.commentsService.editComment(id, commentDto);
      return editedComment;
    } catch (error) {
      console.error("❌ Error edited comment:", error);
      throw new InternalServerErrorException("Error edited comment.");
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
      const commentAvg =
        await this.commentsService.getCommentsAverageRate(productId);
      return { avg: commentAvg };
    } catch (error) {
      console.error(
        `❌ Error retrieving average rate for the product ${productId}:`,
        error
      );
      throw new InternalServerErrorException(
        `Error retrieving average rate for the product ${productId}.`
      );
    }
  }
}
