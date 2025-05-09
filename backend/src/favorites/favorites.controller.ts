/**
 * @file favorites.controller.ts
 * @brief Controller for handling user favorites functionality.
 *
 * This controller provides endpoints to add/remove products to/from a user's favorites,
 * retrieve a user's list of favorites, and check if a product is in a user's favorites.
 */

import { Controller, Get, Post, Delete, Param, Req, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// Extend the Request interface to include the user
interface RequestWithUser extends Request {
  user: {
    sub?: string;
    id?: string;
    username?: string;
    email?: string;
  };
}

@Controller('favorites')
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private readonly favoritesService: FavoritesService) { }

  /**
   * @brief Adds a product to the authenticated user's favorites.
   *
   * @param req The Express request object containing the authenticated user.
   * @param productId The ID of the product to add to favorites.
   * @returns {Promise<any>} A promise resolving to the created favorite entry.
   */
  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  async addToFavorites(@Param('productId') productId: string, @Req() req: RequestWithUser) {
    try {
      const userId = req.user.sub || req.user.id;

      if (!userId) {
        this.logger.error('Unable to add to favorites: User ID not found in token');
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Attempting to add product to favorites - UserId: ${userId}, ProductId: ${productId}`);

      const result = await this.favoritesService.addToFavorites(userId, productId);
      this.logger.log(`Product ${productId} added to favorites for user ${userId} - Status: ${result.exists ? 'Already exists' : 'New'}`);

      return result;
    } catch (error) {
      this.logger.error(`Error adding to favorites: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Error adding to favorites', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Removes a product from the authenticated user's favorites.
   *
   * @param req The Express request object containing the authenticated user.
   * @param productId The ID of the product to remove from favorites.
   */
  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async removeFromFavorites(@Param('productId') productId: string, @Req() req: RequestWithUser) {
    try {
      const userId = req.user.sub || req.user.id;

      if (!userId) {
        this.logger.error('Unable to remove from favorites: User ID not found in token');
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Attempting to remove product from favorites - UserId: ${userId}, ProductId: ${productId}`);

      const result = await this.favoritesService.removeFromFavorites(userId, productId);
      this.logger.log(`Product ${productId} removed from favorites for user ${userId}`);

      return result;
    } catch (error) {
      this.logger.error(`Error removing from favorites: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Error removing from favorites', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Gets all favorites for the authenticated user.
   *
   * @param req The Express request object containing the authenticated user.
   * @returns {Promise<any[]>} A promise resolving to an array of favorite products.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(@Req() req: RequestWithUser) {
    try {
      const userId = req.user.sub || req.user.id;

      // Detailed logs to debug user ID issues
      this.logger.log(`User details: ${JSON.stringify(req.user)}`);
      this.logger.log(`UserID from sub: ${req.user.sub}`);
      this.logger.log(`UserID from id: ${req.user.id}`);
      this.logger.log(`Final UserID: ${userId}`);

      if (!userId) {
        this.logger.error('Unable to retrieve favorites: User ID not found in token');
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Retrieving favorites for user: ${userId}`);

      const favorites = await this.favoritesService.getUserFavorites(userId);
      this.logger.log(`${favorites.length} favorites found for user ${userId}`);

      return favorites;
    } catch (error) {
      this.logger.error(`Error retrieving favorites: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Error retrieving favorites', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @brief Checks if a product is in the authenticated user's favorites.
   *
   * @param req The Express request object containing the authenticated user.
   * @param productId The ID of the product to check.
   * @returns {Promise<{ isFavorite: boolean }>} A promise resolving to whether the product is in favorites.
   */
  @Get(':productId/check')
  @UseGuards(JwtAuthGuard)
  async isProductInFavorites(@Param('productId') productId: string, @Req() req: RequestWithUser) {
    try {
      const userId = req.user.sub || req.user.id;

      if (!userId) {
        this.logger.error('Unable to check favorite status: User ID not found in token');
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Checking favorite status - UserId: ${userId}, ProductId: ${productId}`);

      const isFavorite = await this.favoritesService.isProductInFavorites(userId, productId);
      this.logger.log(`Favorite status for product ${productId}, user ${userId}: ${isFavorite ? 'Favorite' : 'Not favorite'}`);

      return { isFavorite };
    } catch (error) {
      this.logger.error(`Error checking favorite status: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Error checking favorite status', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 