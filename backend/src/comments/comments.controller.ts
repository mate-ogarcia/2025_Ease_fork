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
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentDto } from "./dto/comments.dto";

/**
 * @class CommentsController
 * @brief Controller responsible for managing comment-related API endpoints.
 */
@Controller("comments")
export class CommentsController {
  /**
   * @constructor
   * @brief Initializes the CommentsController with the required services.
   * @param {CommentsService} commentsService - Service for handling comment-related operations.
   */
  constructor(private commentsService: CommentsService) { }

  /**
   * @brief Retrieves all comments from the database with pagination.
   * @route GET /comments/GetAllComments
   * @param {string} page - The page number to retrieve (optional, default: 1).
   * @param {string} pageSize - Number of comments per page (optional, default: 10).
   * @returns {Promise<any>} A promise containing the paginated list of comments.
   * @throws {InternalServerErrorException} If an error occurs while fetching the comments.
   */
  @Get("GetAllComments")
  async getAllComments(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    try {
      const pageNumber = parseInt(page, 10);
      const pageSizeNumber = parseInt(pageSize, 10);
      return await this.commentsService.getAllComments(pageNumber, pageSizeNumber);
    } catch (error) {
      console.error("❌ Error retrieving all comments:", error);
      throw new InternalServerErrorException("Error retrieving all comments.");
    }
  }

  /**
   * @brief Retrieves comments for a specific product with pagination.
   * @route GET /comments/product/:productId
   * @param {string} productId - The ID of the product.
   * @param {string} page - The page number to retrieve (optional, default: 1).
   * @param {string} pageSize - Number of comments per page (optional, default: 10).
   * @returns {Promise<any>} A promise containing the paginated list of comments for the product.
   * @throws {InternalServerErrorException} If an error occurs while fetching the comments.
   */
  @Get("product/:productId")
  async getCommentsForProduct(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    try {
      const pageNumber = parseInt(page, 10);
      const pageSizeNumber = parseInt(pageSize, 10);
      return await this.commentsService.getCommentsForProduct(productId, pageNumber, pageSizeNumber);
    } catch (error) {
      console.error(`❌ Error retrieving comments for product ${productId}:`, error);
      throw new InternalServerErrorException(`Error retrieving comments for product.`);
    }
  }

  /**
   * @brief Adds a new comment to the database.
   * @route POST /comments/add
   * @param {CommentDto} commentDto - The comment data.
   * @returns {Promise<any>} A promise containing the created comment.
   * @throws {InternalServerErrorException} If an error occurs while adding the comment.
   */
  @Post("add")
  async addComment(@Body() commentDto: CommentDto) {
    try {
      return await this.commentsService.createComment(commentDto);
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      throw new InternalServerErrorException("Error adding comment.");
    }
  }
}