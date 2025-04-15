/**
 * @file history.controller.ts
 * @brief Controller for handling requests related to user search history
 *
 * This controller manages routes related to search history, allowing
 * adding items to history, retrieving a user's history,
 * and deleting history entries.
 */

import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpException, HttpStatus, Logger, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * @class HistoryController
 * @brief Controller for history-related functionalities
 */
@Controller('history')
export class HistoryController {
  private readonly logger = new Logger(HistoryController.name);

  /**
   * @brief Constructor for the history controller
   * @param historyService History service for database operations
   */
  constructor(private readonly historyService: HistoryService) {
    this.logger.log('🔍 HistoryController initialized');
  }

  /**
   * @brief Adds a new item to the search history
   * @param historyData Data of the history item to add
   * @returns The added history item
   */
  @Post('add')
  // @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
  async addToHistory(@Body() historyData: any) {
    this.logger.log(`🔍 POST request /history/add received`);
    this.logger.log(`🔍 Complete received data:`, historyData);

    try {
      this.logger.log('🔍 Calling history service to add an item');
      const result = await this.historyService.addToHistory(historyData);
      this.logger.log('✅ Item successfully added to history');
      return result;
    } catch (error) {
      this.logger.error(`❌ Error adding to history: ${error.message}`, error.stack);
      throw new HttpException('Error adding to history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Retrieves the search history of a specific user
   * @param userId User ID
   * @returns List of user's history items
   */
  @Get('user/:userId')
  // @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
  async getUserHistory(@Param('userId') userId: string) {
    this.logger.log(`🔍 GET request /history/user/${userId} received`);

    try {
      this.logger.log('🔍 Calling history service to retrieve user history');
      const result = await this.historyService.getUserHistory(userId);
      this.logger.log(`✅ History successfully retrieved. ${result.length} items found.`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error retrieving history: ${error.message}`, error.stack);
      throw new HttpException('Error retrieving history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Deletes a specific history item
   * @param historyId ID of the history item to delete
   * @returns Confirmation of deletion
   */
  @Delete(':historyId')
  @UseGuards(JwtAuthGuard)
  async deleteHistoryItem(@Param('historyId') historyId: string) {
    this.logger.log(`🔍 DELETE request /history/${historyId} received`);

    try {
      this.logger.log('🔍 Calling history service to delete an item');
      const result = await this.historyService.deleteHistoryItem(historyId);
      this.logger.log('✅ History item successfully deleted');
      return result;
    } catch (error) {
      this.logger.error(`❌ Error deleting history item: ${error.message}`, error.stack);
      throw new HttpException('Error deleting history item', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Clears all history of a specific user
   * @param userId User ID
   * @returns Confirmation of deletion
   */
  @Delete('user/:userId/clear')
  @UseGuards(JwtAuthGuard)
  async clearUserHistory(@Param('userId') userId: string) {
    this.logger.log(`🔍 DELETE request /history/user/${userId}/clear received`);

    try {
      this.logger.log('🔍 Calling history service to clear user history');
      const result = await this.historyService.clearUserHistory(userId);
      this.logger.log(`✅ User history successfully cleared. ${result.deleted} items deleted.`);

      if (result.failed && result.failed > 0) {
        this.logger.warn(`⚠️ ${result.failed} items could not be deleted.`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Error clearing history: ${error.message}`, error.stack);
      throw new HttpException(
        `Error clearing history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @brief Retrieves paginated search history of a specific user
   * @param userId User ID
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @returns Paginated list of user's history items
   */
  @Get('user/:userId/paginated')
  @UseGuards(JwtAuthGuard)
  async getPaginatedUserHistory(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('pageSize', new DefaultValuePipe(0), ParseIntPipe) pageSize: number = 0,
  ) {
    // Si pageSize est spécifié et limit ne l'est pas, utiliser pageSize
    if (pageSize > 0 && limit === 10) {
      limit = pageSize;
    }

    this.logger.log(`🔍 GET request /history/user/${userId}/paginated received with page=${page}, limit=${limit}, pageSize=${pageSize}`);

    try {
      this.logger.log('🔍 Calling history service to retrieve paginated user history');
      const result = await this.historyService.getPaginatedUserHistory(userId, page, limit);
      this.logger.log(`✅ Paginated history successfully retrieved. ${result.items.length} items found.`);

      // Ajouter explicitement les infos de pagination à la réponse pour le frontend
      return {
        items: result.items,
        total: result.total,
        page: page,
        pageSize: limit
      };
    } catch (error) {
      this.logger.error(`❌ Error retrieving paginated history: ${error.message}`, error.stack);
      throw new HttpException('Error retrieving paginated history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
