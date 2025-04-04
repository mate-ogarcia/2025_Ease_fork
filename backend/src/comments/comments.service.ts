/**
 * @file comments.service.ts
 * @brief Service for managing comment-related operations.
 * 
 * This service handles retrieving comments from the database.
 * It interacts with the `DatabaseService` to fetch all stored comments.
 * 
 * @module CommentsService
 */

import { Injectable, InternalServerErrorException } from "@nestjs/common";
// Service
import { DatabaseService } from "../database/database.service";
import { CommentDto } from "./dto/comments.dto";

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
    private databaseService: DatabaseService,
  ) { }

  /**
   * @brief Retrieves all comments from the database.
   * @returns {Promise<any>} A promise containing the list of all comments.
   * @throws {InternalServerErrorException} If an error occurs while fetching comments.
   */
  async getAllComments() {
    try {
      const comments = await this.databaseService.getAllComments();
      return comments;
    } catch (error) {
      console.error("❌ Error retrieving comments:", error);
      throw new InternalServerErrorException("Error retrieving comments.");
    }
  }

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
      const comments = await this.databaseService.addComment(commentDto);
      return comments;
    } catch (error) {
      // Log error and throw an internal server error if adding comment fails
      console.error("❌ Error retrieving comments:", error);
      throw new InternalServerErrorException("Error retrieving comments.");
    }
  }

}
