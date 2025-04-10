/**
 * @file favorites.module.ts
 * @brief Module for handling user favorites functionality.
 *
 * This module handles operations related to user favorites, including adding/removing
 * products from favorites and retrieving a user's list of favorites.
 */

import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule { } 