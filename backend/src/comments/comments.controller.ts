/**
 * @file comments.controller.ts
 * @brief Controller for handling comment-related API endpoints.
 *
 * This controller provides an endpoint to retrieve all comments from the database.
 */

import {
    Controller,
    Get,
    InternalServerErrorException,
  } from "@nestjs/common";
  import { CommentsService } from "./comments.service";
  
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
      constructor (private commentsService: CommentsService) {}
  
      /**
       * @brief Retrieves all comments from the database.
       * @route GET /comments/GetAllComments
       * @returns {Promise<any>} A promise containing the list of all comments.
       * @throws {InternalServerErrorException} If an error occurs while fetching the comments.
       */
      @Get("GetAllComments")
      async getAllComments(){
          try {
              return await this.commentsService.getAllComments();
          } catch (error) {
              console.error("❌ Error retrieving all comments:", error);
              throw new InternalServerErrorException(
                "Error retrieving all comments."
              );
          }
      }
  }
  