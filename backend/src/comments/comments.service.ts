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
  constructor(private databaseService: DatabaseService) { }

  /**
   * @brief Retrieves all comments for a specific product from the database.
   *
   * This method fetches all comments for a given product from the database.
   * It processes the data to extract only the comments and returns them in a flat structure.
   * If an error occurs during the database query, an `InternalServerErrorException` is thrown.
   *
   * @param {string} productId - The ID of the product for which comments are retrieved.
   * @returns {Promise<any[]>} A promise containing an array of comments for the specified product.
   * @throws {InternalServerErrorException} If an error occurs while querying the database for the comments.
   */
  async getCommentsForProduct(productId: string) {
    try {
      // Retrieve all comments for the product
      const comments = await this.databaseService.getProductComments(productId);

      // Extract only the comments from the data
      const flatComments = comments.map(
        (item: any) => item.CommentsBDD ?? item,
      );

      return flatComments;
    } catch (error) {
      throw new InternalServerErrorException(
        "Error retrieving product comments.",
      );
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
      throw new InternalServerErrorException("Error adding comment.");
    }
  }

  /**
   * @brief Edits a comment in the database.
   *
   * This method updates an existing comment in the database based on the provided comment data.
   * If there is an error while editing the comment, an `InternalServerErrorException` is thrown.
   *
   * @param {string} id - The ID of the comment to be edited.
   * @param {CommentDto} commentDto - The data for the updated comment.
   * @returns {Promise<any>} A promise containing the updated comment.
   * @throws {InternalServerErrorException} If an error occurs while editing the comment in the database.
   */
  async editComment(id: string, commentDto: CommentDto): Promise<any> {
    try {
      // Call the database service to update the comment
      return await this.databaseService.updateComment(id, commentDto);
    } catch (error) {
      // Log the error and throw an exception if something goes wrong
      throw new InternalServerErrorException("Error editing comment.");
    }
  }

  /**
   * @brief Deletes a comment from the database.
   *
   * This method deletes a comment from the database based on the provided comment ID.
   * If there is an error while deleting the comment, an `InternalServerErrorException` is thrown.
   *
   * @param {string} id - The ID of the comment to be deleted.
   * @returns {Promise<any>} A promise containing the deleted comment.
   * @throws {InternalServerErrorException} If an error occurs while deleting the comment from the database.
   */
  async deleteComment(id: string): Promise<any> {
    try {
      // Call the database service to delete the comment
      return await this.databaseService.deleteComment(id);
    } catch (error) {
      // Log the error and throw an exception if something goes wrong
      throw new InternalServerErrorException("Error deleting comment.");
    }
  }

  /**
   * @brief Retrieves the total count of comments for a specific product from the database.
   *
   * This method interacts with the database to fetch the total count of comments for the product
   * identified by the given `productId`. If an error occurs during the database query, an exception is thrown.
   *
   * @param {string} productId - The ID of the product for which the comment count is retrieved.
   * @returns {Promise<number>} A promise that resolves to the total comment count for the specified product.
   * @throws {InternalServerErrorException} If an error occurs while querying the database for the comment count.
   */
  async getCommentsCount(productId: string): Promise<number> {
    try {
      // Call the method that queries the database to obtain the number of comments
      return await this.databaseService.getCommentsCount(productId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving comments count for the product ${productId}.`,
      );
    }
  }

  /**
   * @brief Retrieves the average user rating for a specific product.
   *
   * @param productId - The ID of the product whose average rating is to be calculated.
   * @returns A promise resolving to the average rating as a number.
   * @throws InternalServerErrorException if an error occurs while fetching the average rating.
   */
  async getCommentsAverageRate(productId: string): Promise<number> {
    try {
      return await this.databaseService.getAverageRating(productId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving comments average rate for the product ${productId}.`,
      );
    }
  }
}
