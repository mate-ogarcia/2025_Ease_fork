/**
 * @file comments.service.ts
 * @brief Service responsible for handling comment-related operations.
 * 
 * This service interacts with the database to retrieve, create, and manage comments for products.
 * It provides functionality for fetching comments with pagination and adding new comments.
 */
import { Injectable, InternalServerErrorException } from "@nestjs/common";
// Service
import { DatabaseService } from "../database/database.service";
import { CommentDto } from "./dto/comments.dto";

/**
 * @class CommentsService
 * @brief Service responsible for managing comment-related operations.
 * 
 * This service provides methods to handle comments, including retrieving comments for a specific product
 * and adding new comments. It interfaces with the database service to perform operations.
 */
@Injectable()
export class CommentsService {
  /**
   * @constructor
   * @brief Initializes the CommentsService with the required dependencies.
   * 
   * The constructor accepts a `DatabaseService` instance to handle database interactions.
   * 
   * @param {DatabaseService} databaseService - Service for interacting with the database.
   */
  constructor(
    private databaseService: DatabaseService,
  ) {}

  /**
   * @brief Retrieves comments for a specific product with pagination.
   * 
   * This method fetches comments for a product from the database and returns them with pagination metadata.
   * If there is an error while fetching the comments, an `InternalServerErrorException` is thrown.
   * 
   * @param {string} productId - The ID of the product for which comments are retrieved.
   * @param {number} page - The page number to retrieve (starting from 1). Default is 1.
   * @param {number} pageSize - The number of comments to retrieve per page. Default is 10.
   * @returns {Promise<any>} A promise containing an object with the comments and pagination metadata.
   * @throws {InternalServerErrorException} If an error occurs while fetching the comments from the database.
   */
  async getCommentsForProduct(productId: string, page: number = 1, pageSize: number = 10) {
    try {      
      // Calculate the skip value for pagination
      const skip = (page - 1) * pageSize;
      
      // Fetch comments and total count from the database
      const [comments, totalCount] = await this.databaseService.getProductComments(productId, skip, pageSize);
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Extract only the comments from the data
      const flatComments = comments.map((item: any) => item.CommentsBDD ?? item); 
      
      // Prepare the result object with comments and pagination info
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
      return result;
    } catch (error) {
      // Log the error and throw an exception if something goes wrong
      console.error(`❌ Error retrieving comments for product ${productId}:`, error);
      throw new InternalServerErrorException("Error retrieving product comments.");
    }
  }

  /**
   * @brief Creates a new comment in the database.
   * 
   * This method adds a new comment to the database based on the provided comment data.
   * If there is an error while adding the comment, an `InternalServerErrorException` is thrown.
   * 
   * @param {CommentDto} commentDto - The data for the new comment to be added.
   * @returns {Promise<any>} A promise containing the newly created comment.
   * @throws {InternalServerErrorException} If an error occurs while adding the comment to the database.
   */
  async createComment(commentDto: CommentDto): Promise<any> {
    try {
      // Call the database service to add the new comment
      return await this.databaseService.addComment(commentDto);
    } catch (error) {
      // Log the error and throw an exception if something goes wrong
      console.error("❌ Error adding comment:", error);
      throw new InternalServerErrorException("Error adding comment.");
    }
  }
}
