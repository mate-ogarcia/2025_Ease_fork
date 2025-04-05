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

// Étendre l'interface Request pour inclure l'utilisateur
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
        this.logger.error('Impossible d\'ajouter aux favoris: ID utilisateur non trouvé dans le token');
        throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Tentative d'ajout du produit aux favoris - UserId: ${userId}, ProductId: ${productId}`);

      const result = await this.favoritesService.addToFavorites(userId, productId);
      this.logger.log(`Produit ${productId} ajouté aux favoris pour l'utilisateur ${userId} - Statut: ${result.exists ? 'Déjà existant' : 'Nouveau'}`);

      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout aux favoris: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Erreur lors de l\'ajout aux favoris', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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
        this.logger.error('Impossible de supprimer des favoris: ID utilisateur non trouvé dans le token');
        throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Tentative de suppression du produit des favoris - UserId: ${userId}, ProductId: ${productId}`);

      const result = await this.favoritesService.removeFromFavorites(userId, productId);
      this.logger.log(`Produit ${productId} supprimé des favoris pour l'utilisateur ${userId}`);

      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression des favoris: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Erreur lors de la suppression des favoris', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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

      // Logs détaillés pour déboguer le problème d'ID utilisateur
      this.logger.log(`Détails de l'utilisateur: ${JSON.stringify(req.user)}`);
      this.logger.log(`UserID from sub: ${req.user.sub}`);
      this.logger.log(`UserID from id: ${req.user.id}`);
      this.logger.log(`UserID final: ${userId}`);

      if (!userId) {
        this.logger.error('Impossible de récupérer les favoris: ID utilisateur non trouvé dans le token');
        throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Récupération des favoris pour l'utilisateur: ${userId}`);

      const favorites = await this.favoritesService.getUserFavorites(userId);
      this.logger.log(`${favorites.length} favoris trouvés pour l'utilisateur ${userId}`);

      return favorites;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des favoris: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Erreur lors de la récupération des favoris', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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
        this.logger.error('Impossible de vérifier le statut favori: ID utilisateur non trouvé dans le token');
        throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`Vérification du statut favori - UserId: ${userId}, ProductId: ${productId}`);

      const isFavorite = await this.favoritesService.isProductInFavorites(userId, productId);
      this.logger.log(`Statut favori pour le produit ${productId}, utilisateur ${userId}: ${isFavorite ? 'Favori' : 'Non favori'}`);

      return { isFavorite };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du statut favori: ${error.message}`, error.stack);
      throw new HttpException(error.message || 'Erreur lors de la vérification du statut favori', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 