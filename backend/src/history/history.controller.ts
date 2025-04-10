/**
 * @file history.controller.ts
 * @brief Controller for handling requests related to user search history
 *
 * This controller manages routes related to search history, allowing
 * adding items to history, retrieving a user's history,
 * and deleting history entries.
 */

import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
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
}
