/**
 * @file favorites.service.ts
 * @brief Service for handling user favorites functionality.
 *
 * This service provides methods to add/remove products to/from a user's favorites,
 * retrieve a user's list of favorites, and check if a product is in a user's favorites.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * @brief Adds a product to a user's favorites.
   *
   * @param userId The ID of the user.
   * @param productId The ID of the product to add to favorites.
   * @returns {Promise<any>} A promise resolving to the created favorite entry.
   */
  async addToFavorites(userId: string, productId: string): Promise<any> {
    return this.databaseService.addToFavorites(userId, productId);
  }

  /**
   * @brief Removes a product from a user's favorites.
   *
   * @param userId The ID of the user.
   * @param productId The ID of the product to remove from favorites.
   * @returns {Promise<boolean>} A promise resolving to true if the favorite was removed.
   */
  async removeFromFavorites(userId: string, productId: string): Promise<boolean> {
    return this.databaseService.removeFromFavorites(userId, productId);
  }

  /**
   * @brief Gets all favorites for a user.
   *
   * @param userId The ID of the user.
   * @returns {Promise<any[]>} A promise resolving to an array of favorite products.
   */
  async getUserFavorites(userId: string): Promise<any[]> {
    return this.databaseService.getUserFavorites(userId);
  }

  /**
   * @brief Checks if a product is in a user's favorites.
   *
   * @param userId The ID of the user.
   * @param productId The ID of the product to check.
   * @returns {Promise<boolean>} A promise resolving to true if the product is in favorites.
   */
  async isProductInFavorites(userId: string, productId: string): Promise<boolean> {
    return this.databaseService.isProductInFavorites(userId, productId);
  }

  /**
   * @brief Extracts the user ID from a JWT token.
   *
   * @param token The JWT token to extract the user ID from.
   * @returns {string} The user ID extracted from the token.
   */
  extractUserIdFromToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 